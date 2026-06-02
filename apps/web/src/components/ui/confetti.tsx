"use client";

const COLORS = ["#00c896", "#00a878", "#d97706", "#0c1814", "#ffffff"];

export function ConfettiBurst() {
  return (
    <div className="confetti-burst" aria-hidden>
      {Array.from({ length: 28 }).map((_, i) => (
        <span
          key={i}
          style={{
            left: `${(i * 17) % 100}%`,
            background: COLORS[i % COLORS.length],
            animationDelay: `${(i % 8) * 0.12}s`,
            width: i % 3 === 0 ? 6 : 8,
            height: i % 2 === 0 ? 8 : 6,
            borderRadius: i % 4 === 0 ? "50%" : 2,
          }}
        />
      ))}
    </div>
  );
}
