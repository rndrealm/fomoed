export interface PreviousRace {
  races: Race[];
  previous_races: PreviousRaces;
}

export interface PreviousRaces {
  race_id: string;
  start_time: Date;
  current_time: number;
  is_active: boolean;
  is_finished: boolean;
  ducks: Duck[];
  seed: string;
  winner: number;
  race_duration: number;
  base_speed: number;
  volatility: number;
  finish_time: Date;
  podium: AllResult[];
  all_results: AllResult[];
}

export interface AllResult {
  id: number;
  name: string;
  position: number;
}

export interface Duck {
  id: number;
  name: string;
  position: number;
  weight: number;
  odds: number;
}

export interface Race {
  race_id: string;
  time_slot: Date;
  bet_type_pools: { [key: string]: number };
}

export interface RaceUpdate {
  race_id: string;
  current_time: number;
  is_finished: boolean;
  max_position: number;
  race_sponsor: null;
  race_pool: { [key: string]: number };
  ducks: Duck[];
}

export interface RaceFinished {
  race_id: string;
  finish_time: Date;
  race_duration: number;
  winner: Winner;
  podium: Winner[];
  all_results: Winner[];
}

export interface Winner {
  id: number;
  name: string;
  position: number;
}
