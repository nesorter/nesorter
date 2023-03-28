import { StageRuleManager } from '@/radio-service/Sequencer/StageRuleManager';
import { Storage } from '@/radio-service/Storage';
import {
  AggregatedStage,
  DtoStageAddRules,
  DtoStageCreate,
  DtoStageUpdate,
  MinimumAggregatedStage,
} from '@/radio-service/types';

export class StageManager {
  id: number;
  stage?: MinimumAggregatedStage;
  stageRules?: StageRuleManager[];

  constructor(id: number) {
    this.id = id;
  }

  async init() {
    this.stage = await Storage.stage.findFirstOrThrow({
      where: { id: this.id },
      include: {
        rules: true,
      },
    });

    if (this.stage?.rules?.length) {
      this.stageRules = [];

      for (const sub of this.stage.rules) {
        const rule = new StageRuleManager(sub.id);
        await rule.init();

        this.stageRules.push(rule);
      }
    }
  }

  read(): AggregatedStage {
    if (!this.stage) {
      throw new Error('call .init() first');
    }

    return {
      ...this.stage,
      rules: this.stageRules?.map((_) => _.read()),
    };
  }

  async delete() {
    await this.init();

    await Promise.all(this.stageRules?.map((stageRule) => stageRule.delete()) || []);
    await Storage.stage.delete({ where: { id: this.id } });
  }

  async addRules(dto: DtoStageAddRules) {
    for (const ruleDef of dto.rulesDtos) {
      await StageRuleManager.create({ ...ruleDef, stageId: this.id });
    }

    await this.init();
    return this.read();
  }

  async update(dto: DtoStageUpdate) {
    await Storage.stage.update({
      data: { name: dto.name },
      where: { id: this.id },
    });
    await this.init();
    return this.read();
  }

  static async create(dto: DtoStageCreate): Promise<StageManager> {
    const created = await Storage.stage.create({
      data: { name: dto.name },
    });

    for (const ruleDef of dto.rulesDtos) {
      await StageRuleManager.create({ ...ruleDef, stageId: created.id });
    }

    const instance = new StageManager(created.id);
    await instance.init();
    return instance;
  }
}
