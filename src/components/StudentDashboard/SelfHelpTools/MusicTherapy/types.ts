export interface MusicCardProps {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: number;
  artist?: string;
  album?: string;
  coverImage?: string;
  onClick?: () => void;
}
