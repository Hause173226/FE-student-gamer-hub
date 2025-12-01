import React from 'react';
import { Gamepad2, Trophy, Star, Zap, Target, Sparkles, Award, Crown, Gem, Gift } from 'lucide-react';

type Theme = 'dashboard' | 'games' | 'events' | 'communities' | 'friends' | 'quests' | 'membership';

interface AnimatedHeaderProps {
  children: React.ReactNode;
  theme?: Theme;
}

const themeColors: Record<Theme, string[]> = {
  dashboard: ['#87ddfe', '#ff926b', '#acaaff', '#1bffc2', '#f9a5fe'], // Pastel: Blue, Orange, Purple, Cyan, Pink
  games: ['#ff006e', '#8338ec', '#3a86ff', '#06ffa5', '#ffbe0b'], // Gaming Neon: Hot Pink, Purple, Blue, Green, Yellow
  events: ['#ff6b6b', '#ffa500', '#ffd700', '#ff6347', '#ff8c00'], // Red, Orange, Gold, Tomato, DarkOrange
  communities: ['#4ecdc4', '#44a3a7', '#95e1d3', '#6c5ce7', '#a29bfe'], // Teal, Cyan, Mint, Purple, Lavender
  friends: ['#ff9ff3', '#f368e0', '#ff6b9d', '#c44569', '#f8b500'], // Pink, Magenta, Rose, Dark Pink, Yellow
  quests: ['#feca57', '#ff9ff3', '#48dbfb', '#0abde3', '#ff6348'], // Yellow, Pink, Light Blue, Blue, Red
  membership: ['#ff6348', '#ffa502', '#ffd32a', '#ff6b81', '#ff4757'], // Red, Orange, Yellow, Pink, Red
};

export const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({ children, theme = 'dashboard' }) => {
  const colors = themeColors[theme];
  
  // Generate random particles - use useMemo to prevent regeneration on every render
  const particles = React.useMemo(() => {
    if (theme === 'games') {
      // For games theme: use game icons with meteor animation (bay nhanh từ trái sang phải)
      const gameIcons = ['gamepad', 'trophy', 'star', 'zap', 'target', 'sparkles'] as const;
      return Array.from({ length: 15 }, (_, i) => ({
        id: i,
        type: gameIcons[Math.floor(Math.random() * gameIcons.length)],
        size: Math.random() * 16 + 16, // 16-32px
        top: Math.random() * 80 + 10, // 10-90% - vertical position
        duration: Math.random() * 4 + 5, // 5-9s - speed (chậm hơn, mượt hơn)
        delay: Math.random() * 12, // 0-12s - stagger start time (tránh kẹt khi load)
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 30 - 15, // -15 to 15 degrees tilt
      }));
    } else if (theme === 'quests') {
      // For quests theme: rising stars/sparkles animation (bay lên từ dưới lên trên)
      const questIcons = ['star', 'trophy', 'award', 'sparkles', 'gift'] as const;
      return Array.from({ length: 30 }, (_, i) => ({
        id: i,
        type: i % 2 === 0 ? questIcons[Math.floor(Math.random() * questIcons.length)] : 'circle',
        size: Math.random() * 14 + 12, // 12-26px
        left: Math.random() * 100, // 0-100% - horizontal position
        bottom: -30, // Start from gần dưới màn hình (gần hơn)
        duration: Math.random() * 5 + 8, // 8-13s - rising speed (giữ nguyên)
        delay: Math.random() * 12, // 0-12s - stagger
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360, // Random rotation
      }));
    } else if (theme === 'membership') {
      // For membership theme: orbital glow animation (xoay tròn với glow effect)
      const membershipIcons = ['crown', 'gem', 'star', 'trophy', 'award'] as const;
      return Array.from({ length: 20 }, (_, i) => ({
        id: i,
        type: i % 3 === 0 ? membershipIcons[Math.floor(Math.random() * membershipIcons.length)] : 
              i % 3 === 1 ? 'circle' : 
              'diamond',
        size: Math.random() * 14 + 12, // 12-26px
        centerX: Math.random() * 100, // 0-100% - center point X
        centerY: Math.random() * 100, // 0-100% - center point Y
        radius: Math.random() * 60 + 80, // 80-140px - orbit radius
        duration: Math.random() * 15 + 20, // 20-35s - orbit speed
        delay: Math.random() * 5, // 0-5s
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360, // Random initial rotation
      }));
    } else {
      // For other themes: use basic shapes with float animation
      return Array.from({ length: 40 }, (_, i) => ({
        id: i,
        type: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'triangle',
        size: Math.random() * 15 + 8, // 8-23px
        left: Math.random() * 100, // 0-100%
        top: Math.random() * 100, // 0-100%
        duration: Math.random() * 25 + 20, // 20-45s
        delay: Math.random() * 8, // 0-8s
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: 0,
      }));
    }
  }, [colors, theme]);

  return (
    <div className="relative bg-gray-800 shadow-sm border-b border-gray-700 overflow-hidden" style={{ minHeight: '200px' }}>
      {/* Animated Particles Background */}
      <div className="absolute inset-0 z-0">
        {particles.map((particle) => {
          if (theme === 'games') {
            // Games theme: Meteor animation (bay nhanh từ trái sang phải với trail)
            return (
              <div
                key={particle.id}
                className="absolute animate-meteor"
                style={{
                  top: `${particle.top}%`,
                  left: '-80px', // Bắt đầu từ gần bên trái màn hình (gần hơn)
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  animationDuration: `${particle.duration}s`,
                  animationDelay: `${particle.delay}s`,
                  animationIterationCount: 'infinite',
                  color: particle.color,
                  transform: `rotate(${particle.rotation}deg)`,
                  willChange: 'transform, opacity',
                }}
              >
                {/* Trail effect - đuôi thiên thạch */}
                <div
                  className="meteor-trail"
                  style={{
                    left: `-100px`,
                    top: '50%',
                    color: particle.color,
                    animationDuration: `${particle.duration}s`,
                    animationDelay: `${particle.delay}s`,
                    animationIterationCount: 'infinite',
                  }}
                />
                {particle.type === 'circle' && (
                  <div
                    className="w-full h-full rounded-full"
                    style={{ backgroundColor: particle.color, opacity: 0.6 }}
                  />
                )}
                {particle.type === 'square' && (
                  <div
                    className="w-full h-full"
                    style={{ backgroundColor: particle.color, opacity: 0.6, transform: 'rotate(45deg)' }}
                  />
                )}
                {particle.type === 'triangle' && (
                  <div
                    className="w-full h-full"
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: `${particle.size / 2}px solid transparent`,
                      borderRight: `${particle.size / 2}px solid transparent`,
                      borderBottom: `${particle.size}px solid ${particle.color}`,
                      opacity: 0.6,
                    }}
                  />
                )}
                {particle.type === 'hexagon' && (
                  <div
                    className="w-full h-full"
                    style={{
                      width: `${particle.size}px`,
                      height: `${particle.size}px`,
                      backgroundColor: particle.color,
                      opacity: 0.7,
                      clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
                      transform: `rotate(${particle.rotation}deg)`,
                    }}
                  />
                )}
                {particle.type === 'diamond' && (
                  <div
                    className="w-full h-full"
                    style={{
                      width: `${particle.size}px`,
                      height: `${particle.size}px`,
                      backgroundColor: particle.color,
                      opacity: 0.7,
                      transform: `rotate(45deg) rotate(${particle.rotation}deg)`,
                    }}
                  />
                )}
                {particle.type === 'gamepad' && (
                  <Gamepad2 
                    size={particle.size} 
                    style={{ color: particle.color }}
                    className="animate-pulse-glow"
                  />
                )}
                {particle.type === 'trophy' && (
                  <Trophy 
                    size={particle.size} 
                    style={{ color: particle.color }}
                    className="animate-pulse-glow"
                  />
                )}
                {particle.type === 'star' && (
                  <Star 
                    size={particle.size} 
                    style={{ color: particle.color, fill: particle.color }}
                    className="animate-pulse-glow"
                  />
                )}
                {particle.type === 'zap' && (
                  <Zap 
                    size={particle.size} 
                    style={{ color: particle.color }}
                    className="animate-pulse-glow"
                  />
                )}
                {particle.type === 'target' && (
                  <Target 
                    size={particle.size} 
                    style={{ color: particle.color }}
                    className="animate-pulse-glow"
                  />
                )}
                {particle.type === 'sparkles' && (
                  <Sparkles 
                    size={particle.size} 
                    style={{ color: particle.color }}
                    className="animate-pulse-glow"
                  />
                )}
              </div>
            );
          } else if (theme === 'quests') {
            // Quests theme: Rising stars animation (bay lên từ dưới lên trên)
            return (
              <div
                key={particle.id}
                className="absolute animate-rise-up"
                style={{
                  left: `${particle.left}%`,
                  bottom: `${particle.bottom}px`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  animationDuration: `${particle.duration}s`,
                  animationDelay: `${particle.delay}s`,
                  animationIterationCount: 'infinite',
                  color: particle.color,
                  willChange: 'transform, opacity',
                }}
              >
                {particle.type === 'circle' && (
                  <div
                    className="w-full h-full rounded-full animate-sparkle"
                    style={{ backgroundColor: particle.color }}
                  />
                )}
                {particle.type === 'star' && (
                  <Star 
                    size={particle.size} 
                    style={{ color: particle.color, fill: particle.color }}
                    className="animate-sparkle"
                  />
                )}
                {particle.type === 'trophy' && (
                  <Trophy 
                    size={particle.size} 
                    style={{ color: particle.color }}
                    className="animate-sparkle"
                  />
                )}
                {particle.type === 'award' && (
                  <Award 
                    size={particle.size} 
                    style={{ color: particle.color }}
                    className="animate-sparkle"
                  />
                )}
                {particle.type === 'sparkles' && (
                  <Sparkles 
                    size={particle.size} 
                    style={{ color: particle.color }}
                    className="animate-sparkle"
                  />
                )}
                {particle.type === 'gift' && (
                  <Gift 
                    size={particle.size} 
                    style={{ color: particle.color }}
                    className="animate-sparkle"
                  />
                )}
              </div>
            );
          } else if (theme === 'membership') {
            // Membership theme: Orbital glow animation (xoay tròn với glow effect)
            return (
              <div
                key={particle.id}
                className="absolute animate-orbital-glow"
                style={{
                  left: `${particle.centerX}%`,
                  top: `${particle.centerY}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  animationDuration: `${particle.duration}s`,
                  animationDelay: `${particle.delay}s`,
                  animationIterationCount: 'infinite',
                  transformOrigin: `0 ${particle.radius}px`,
                  color: particle.color,
                }}
              >
                {particle.type === 'circle' && (
                  <div
                    className="w-full h-full rounded-full animate-glow-pulse"
                    style={{ backgroundColor: particle.color }}
                  />
                )}
                {particle.type === 'diamond' && (
                  <div
                    className="w-full h-full animate-glow-pulse"
                    style={{
                      width: `${particle.size}px`,
                      height: `${particle.size}px`,
                      backgroundColor: particle.color,
                      transform: `rotate(45deg) rotate(${particle.rotation}deg)`,
                    }}
                  />
                )}
                {particle.type === 'crown' && (
                  <Crown 
                    size={particle.size} 
                    style={{ color: particle.color }}
                    className="animate-glow-pulse"
                  />
                )}
                {particle.type === 'gem' && (
                  <Gem 
                    size={particle.size} 
                    style={{ color: particle.color }}
                    className="animate-glow-pulse"
                  />
                )}
                {particle.type === 'star' && (
                  <Star 
                    size={particle.size} 
                    style={{ color: particle.color, fill: particle.color }}
                    className="animate-glow-pulse"
                  />
                )}
                {particle.type === 'trophy' && (
                  <Trophy 
                    size={particle.size} 
                    style={{ color: particle.color }}
                    className="animate-glow-pulse"
                  />
                )}
                {particle.type === 'award' && (
                  <Award 
                    size={particle.size} 
                    style={{ color: particle.color }}
                    className="animate-glow-pulse"
                  />
                )}
              </div>
            );
          } else {
            // Other themes: Float animation
            return (
              <div
                key={particle.id}
                className="absolute animate-float"
                style={{
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  animationDuration: `${particle.duration}s`,
                  animationDelay: `${particle.delay}s`,
                  color: particle.color,
                }}
              >
            {particle.type === 'circle' && (
              <div
                className="w-full h-full rounded-full"
                style={{ backgroundColor: particle.color, opacity: 0.6 }}
              />
            )}
            {particle.type === 'square' && (
              <div
                className="w-full h-full"
                style={{ backgroundColor: particle.color, opacity: 0.6, transform: 'rotate(45deg)' }}
              />
            )}
            {particle.type === 'triangle' && (
              <div
                className="w-full h-full"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: `${particle.size / 2}px solid transparent`,
                  borderRight: `${particle.size / 2}px solid transparent`,
                  borderBottom: `${particle.size}px solid ${particle.color}`,
                  opacity: 0.6,
                }}
              />
            )}
            {particle.type === 'hexagon' && (
              <div
                className="w-full h-full"
                style={{
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  backgroundColor: particle.color,
                  opacity: 0.7,
                  clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
                  transform: `rotate(${particle.rotation}deg)`,
                }}
              />
            )}
            {particle.type === 'diamond' && (
              <div
                className="w-full h-full"
                style={{
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  backgroundColor: particle.color,
                  opacity: 0.7,
                  transform: `rotate(45deg) rotate(${particle.rotation}deg)`,
                }}
              />
            )}
            {particle.type === 'gamepad' && (
              <Gamepad2 
                size={particle.size} 
                style={{ color: particle.color }}
                className="animate-pulse-glow"
              />
            )}
            {particle.type === 'trophy' && (
              <Trophy 
                size={particle.size} 
                style={{ color: particle.color }}
                className="animate-pulse-glow"
              />
            )}
            {particle.type === 'star' && (
              <Star 
                size={particle.size} 
                style={{ color: particle.color, fill: particle.color }}
                className="animate-pulse-glow"
              />
            )}
            {particle.type === 'zap' && (
              <Zap 
                size={particle.size} 
                style={{ color: particle.color }}
                className="animate-pulse-glow"
              />
            )}
            {particle.type === 'target' && (
              <Target 
                size={particle.size} 
                style={{ color: particle.color }}
                className="animate-pulse-glow"
              />
            )}
            {particle.type === 'sparkles' && (
              <Sparkles 
                size={particle.size} 
                style={{ color: particle.color }}
                className="animate-pulse-glow"
              />
            )}
              </div>
            );
          }
        })}
      </div>

      {/* Overlay để text rõ ràng hơn */}
      <div className="absolute inset-0 z-5 bg-black/30"></div>

      {/* Content */}
      <div className="relative z-10">
        <div className="text-white [text-shadow:_2px_2px_4px_rgb(0_0_0_/_50%)]">
          {children}
        </div>
      </div>
    </div>
  );
};

