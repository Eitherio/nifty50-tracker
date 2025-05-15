'use client';
import { useParams } from 'next/navigation';

export default function CompanyDetail() {
  const { symbol } = useParams();

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2rem' }}>
        📊 Company Detail Page
      </h1>

      <p style={{ fontSize: '1.25rem' }}>
        Showing data for: <strong>{symbol}</strong>
      </p>

      {/* Later: Add chart, description, etc. */}
    </main>
  );
}
