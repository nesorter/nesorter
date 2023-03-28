import { StageManager, StageRuleManager } from '@/radio-service/Sequencer';
import { Storage } from '@/radio-service/Storage';
import {
  AggregatedSequence,
  DtoSequenceAddRules,
  DtoSequenceCreate,
  DtoSequenceUpdate,
  MinimumAggregatedSequence,
} from '@/radio-service/types';

export class SequenceManager {
  id: number;
  sequence?: MinimumAggregatedSequence;
  stageUp?: StageManager;
  stageDown?: StageManager;
  stageSubRules?: StageRuleManager[];

  constructor(id: number) {
    this.id = id;
  }

  async init() {
    this.sequence = await Storage.targetSequence.findFirstOrThrow({
      where: { id: this.id },
      include: {
        stageSubRules: true,
        stageUp: true,
        stageDown: true,
      },
    });

    if (this.sequence.stageUpId) {
      this.stageUp = new StageManager(this.sequence.stageUpId);
      await this.stageUp.init();
    }

    if (this.sequence.stageDownId) {
      this.stageDown = new StageManager(this.sequence.stageDownId);
      await this.stageDown.init();
    }

    if (this.sequence?.stageSubRules?.length) {
      this.stageSubRules = [];

      for (const sub of this.sequence.stageSubRules) {
        const rule = new StageRuleManager(sub.id);
        await rule.init();

        this.stageSubRules.push(rule);
      }
    }
  }

  read(): AggregatedSequence {
    if (!this.sequence) {
      throw new Error('call .init() first');
    }

    return {
      ...this.sequence,
      stageUp: this.stageUp?.read(),
      stageDown: this.stageDown?.read(),
      stageSubRules: this.stageSubRules?.map((_) => _.read()),
    };
  }

  async delete() {
    await this.init();

    if (this.stageUp) {
      await this.stageUp.delete();
    }

    if (this.stageDown) {
      await this.stageDown.delete();
    }

    await Promise.all(this.stageSubRules?.map((_) => _.delete()) || []);
  }

  async update(dto: DtoSequenceUpdate) {
    await Storage.targetSequence.update({
      data: { subWaveLength: dto.subWaveLength },
      where: { id: this.id },
    });

    await this.init();
    return this.read();
  }

  async addSubRules(dto: DtoSequenceAddRules) {
    for (const ruleDef of dto.subRulesDtos) {
      await StageRuleManager.create({ ...ruleDef, sequenceId: this.id });
    }

    await this.init();
    return this.read();
  }

  static async create(dto: DtoSequenceCreate): Promise<SequenceManager> {
    const stageUp = await StageManager.create(dto.stageUpDto);
    const stageDown = await StageManager.create(dto.stageDownDto);

    const created = await Storage.targetSequence.create({
      data: {
        subWaveLength: dto.subWaveLength,
        stageUp: {
          connect: { id: stageUp.id },
        },
        stageDown: {
          connect: { id: stageDown.id },
        },
      },
    });

    if (dto.subRulesDtos) {
      for (const subRuleDef of dto.subRulesDtos) {
        await StageRuleManager.create({ ...subRuleDef, sequenceId: created.id });
      }
    }

    const instance = new SequenceManager(created.id);
    await instance.init();
    return instance;
  }
}
