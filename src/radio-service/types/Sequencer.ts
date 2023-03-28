import {
  ClassItem,
  Playlist,
  Stage,
  StageRule,
  TargetPlaylists,
  TargetSequence,
  TargetTags,
} from '@prisma/client';

export type DtoStageCreate = {
  name: string;
  rulesDtos: Omit<DtoStageRuleCreate, 'id'>[];
};

export type DtoStageUpdate = {
  name: string;
};

export type DtoStageAddRules = {
  rulesDtos: DtoStageCreate['rulesDtos'];
};

export type MinimumAggregatedStage = Stage & {
  rules: StageRule[] | null;
};

export type AggregatedStage = Stage & {
  rules?: AggregatedStageRule[];
};

export type DtoSequenceCreate = {
  subWaveLength: number;
  stageUpDto: DtoStageCreate;
  stageDownDto: DtoStageCreate;
  subRulesDtos: Omit<DtoStageRuleCreate, 'sequenceId'>[];
};

export type DtoSequenceUpdate = {
  subWaveLength: number;
};

export type DtoSequenceAddRules = {
  subRulesDtos: Omit<DtoStageRuleCreate, 'sequenceId'>[];
};

export type MinimumAggregatedSequence = TargetSequence & {
  stageSubRules: StageRule[] | null;
  stageUp: Stage | null;
  stageDown: Stage | null;
};

export type AggregatedSequence = TargetSequence & {
  stageSubRules?: AggregatedStageRule[];
  stageUp?: AggregatedStage;
  stageDown?: AggregatedStage;
};

export type MinimumAggregatedStageRule = StageRule & {
  targetSequence: TargetSequence | null;
  targetTags: (TargetTags & { classItem: ClassItem[] }) | null;
  targetPlaylists: (TargetPlaylists & { playlists: Playlist[] }) | null;
};

export type AggregatedStageRule = Omit<MinimumAggregatedStageRule, 'targetSequence'> & {
  targetSequence?: AggregatedSequence;
};

export type DtoStageRuleCreate = {
  stageId?: number;
  type: 'MAINLINE' | 'TIMEABLE';

  timeFrom?: number;
  timeTo?: number;

  targetType?: 'TAGS' | 'SEQUENCE' | 'PLAYLISTS';
  tagsIds?: number[];
  sequenceId?: number;
  playlistsIds?: number[];
};

export type DtoStageRuleUpdate = {
  id: number;
  type?: DtoStageRuleCreate['type'];

  timeFrom?: number;
  timeTo?: number;

  targetType?: DtoStageRuleCreate['targetType'];
  tagsIds?: number[];
  sequenceId?: number;
  playlistsIds?: number[];
};
