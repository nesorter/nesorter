import { SequenceManager } from '@/radio-service/Sequencer/SequenceManager';
import { Storage } from '@/radio-service/Storage';
import {
  AggregatedStageRule,
  DtoStageRuleCreate,
  DtoStageRuleUpdate,
  MinimumAggregatedStageRule,
} from '@/radio-service/types';

export class StageRuleManager {
  id: number;
  stageRule?: MinimumAggregatedStageRule;
  targetSequence?: SequenceManager;

  constructor(id: number) {
    this.id = id;
  }

  async init() {
    this.stageRule = await Storage.stageRule.findFirstOrThrow({
      where: { id: this.id },
      include: {
        targetSequence: true,
        targetTags: {
          include: { classItem: true },
        },
        targetPlaylists: {
          include: { playlists: true },
        },
      },
    });

    if (this.stageRule?.targetSequence?.id) {
      this.targetSequence = new SequenceManager(this.stageRule.targetSequence.id);
      await this.targetSequence.init();
    }
  }

  read(): AggregatedStageRule {
    if (!this.stageRule) {
      throw new Error('call .init() first');
    }

    return {
      ...this.stageRule,
      targetSequence: this.targetSequence?.read(),
    };
  }

  async delete() {
    await this.init();

    if (this.targetSequence) {
      await this.targetSequence.delete();
    }

    await Storage.stageRule.delete({ where: { id: this.id } });
  }

  async update(dto: DtoStageRuleUpdate): Promise<AggregatedStageRule> {
    StageRuleManager.checkDto(dto);

    await this.init();
    const transactions = [];

    if (this.stageRule?.type === 'TAGS') {
      transactions.push(() =>
        Storage.targetTags.deleteMany({
          where: {
            stageRules: {
              some: { id: this.id },
            },
          },
        }),
      );
    }

    if (this.stageRule?.type === 'PLAYLISTS') {
      transactions.push(() =>
        Storage.targetPlaylists.deleteMany({
          where: {
            stageRules: {
              some: { id: this.id },
            },
          },
        }),
      );
    }

    if (this.stageRule?.type === 'SEQUENCE') {
      transactions.push(() =>
        Storage.targetSequence.delete({
          where: {
            id: Number(this.stageRule?.targetSequenceId),
          },
        }),
      );
    }

    transactions.push(() =>
      Storage.stageRule.update({
        where: { id: dto.id },
        data: {
          type: dto.type,
          timeTo: dto.timeTo,
          timeFrom: dto.timeFrom,
          targetType: dto.targetType,

          targetTags:
            dto.targetType === 'TAGS'
              ? {
                  create: {
                    classItem: {
                      connect: dto.tagsIds?.map((id) => ({ id })),
                    },
                  },
                }
              : undefined,

          targetPlaylists:
            dto.targetType === 'PLAYLISTS'
              ? {
                  create: {
                    playlists: {
                      connect: dto.playlistsIds?.map((id) => ({ id })),
                    },
                  },
                }
              : undefined,

          targetSequence:
            dto.targetType === 'SEQUENCE'
              ? {
                  connect: {
                    id: dto.sequenceId,
                  },
                }
              : undefined,
        },
      }),
    );

    await Storage.$transaction(transactions.map((_) => _()));

    await this.init();
    return this.read();
  }

  static async create(dto: DtoStageRuleCreate): Promise<StageRuleManager> {
    StageRuleManager.checkDto(dto);

    const created = await Storage.stageRule.create({
      data: {
        stage: dto.stageId
          ? {
              connect: {
                id: dto.stageId,
              },
            }
          : undefined,

        type: dto.type,
        timeTo: dto.timeTo,
        timeFrom: dto.timeFrom,
        targetType: dto.targetType,

        targetTags:
          dto.targetType === 'TAGS'
            ? {
                create: {
                  classItem: {
                    connect: dto.tagsIds?.map((id) => ({ id })),
                  },
                },
              }
            : undefined,

        targetPlaylists:
          dto.targetType === 'PLAYLISTS'
            ? {
                create: {
                  playlists: {
                    connect: dto.playlistsIds?.map((id) => ({ id })),
                  },
                },
              }
            : undefined,

        targetSequence:
          dto.targetType === 'SEQUENCE'
            ? {
                connect: {
                  id: dto.sequenceId,
                },
              }
            : undefined,
      },
    });

    const instance = new StageRuleManager(created.id);
    await instance.init();
    return instance;
  }

  static checkDto(dto: DtoStageRuleUpdate | DtoStageRuleCreate) {
    if (dto.type === 'TIMEABLE') {
      if (dto.timeTo === undefined || dto.timeFrom === undefined) {
        throw new Error(`for 'type === TIMEABLE' fields 'timeTo' and 'timeFrom' are required`);
      }
    }

    if (dto.targetType === 'TAGS' && (dto.tagsIds === undefined || !dto.tagsIds.length)) {
      throw new Error(
        `for 'targetType === TAGS' field 'tagsIds' are required and must contain at least 1 item`,
      );
    }

    if (
      dto.targetType === 'PLAYLISTS' &&
      (dto.playlistsIds === undefined || !dto.playlistsIds.length)
    ) {
      throw new Error(
        `for 'targetType === PLAYLISTS' field 'playlistsIds' are required and must contain at least 1 item`,
      );
    }

    if (dto.targetType === 'SEQUENCE' && dto.sequenceId === undefined) {
      throw new Error(`for 'targetType === SEQUENCE' field 'sequenceId' are required`);
    }

    return true;
  }
}
