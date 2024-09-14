import dynamic from 'next/dynamic'

const OptiPic = dynamic(() => import('../components/OptiPic'), { ssr: false })

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <OptiPic />
    </main>
  );
}