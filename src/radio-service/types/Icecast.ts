export type IcecastStatus = {
  '?xml'?: string;
  icestats?: IcecastStats;
};

export type IcecastStats = {
  admin?: string;
  client_connections?: number;
  clients?: number;
  connections?: number;
  file_connections?: number;
  host?: string;
  listener_connections?: number;
  listeners?: number;
  location?: string;
  server_id?: string;
  server_start?: string;
  server_start_iso8601?: string;
  source_client_connections?: number;
  source_relay_connections?: number;
  source_total_connections?: number;
  sources?: number;
  stats?: number;
  stats_connections?: number;
  source?: IcecastSource;
};

export type IcecastSource = {
  genre?: string;
  listener_peak?: number;
  listeners?: number;
  listenurl?: string;
  max_listeners?: string;
  public?: number;
  server_description?: string;
  server_name?: string;
  server_type?: string;
  slow_listeners?: number;
  source_ip?: string;
  stream_start?: string;
  stream_start_iso8601?: string;
  title?: string;
  total_bytes_read?: number;
  total_bytes_sent?: number;
  user_agent?: string;
};
