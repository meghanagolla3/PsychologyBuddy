import React from 'react';

// Lucide React icons for the meditation player
import { 
  X, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2,
  Headphones,
  Music,
  Repeat
} from 'lucide-react';

export const Icons = {
  X: (props: React.SVGProps<SVGSVGElement>) => <X {...props} />,
  Play: (props: React.SVGProps<SVGSVGElement>) => <Play {...props} />,
  Pause: (props: React.SVGProps<SVGSVGElement>) => <Pause {...props} />,
  SkipBack: (props: React.SVGProps<SVGSVGElement>) => <SkipBack {...props} />,
  SkipForward: (props: React.SVGProps<SVGSVGElement>) => <SkipForward {...props} />,
  Volume2: (props: React.SVGProps<SVGSVGElement>) => <Volume2 {...props} />,
  Headphones: (props: React.SVGProps<SVGSVGElement>) => <Headphones {...props} />,
  Music: (props: React.SVGProps<SVGSVGElement>) => <Music {...props} />,
  Repeat: (props: React.SVGProps<SVGSVGElement>) => <Repeat {...props} />,
};
