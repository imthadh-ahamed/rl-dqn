
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl mb-6">
            DQN Web App
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Interactive Deep Q-Network training and visualization for the CartPole-v1 environment.
            Train RL agents, watch real-time progress, and analyze performance metrics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/simulation">
              <Button size="lg" className="w-full sm:w-auto">
                Start Training
              </Button>
            </Link>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              View Documentation
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card title="Real-time Training">
            <p className="text-gray-600">
              Watch your DQN agent learn in real-time with live metrics,
              charts, and performance indicators.
            </p>
          </Card>

          <Card title="Interactive Dashboard">
            <p className="text-gray-600">
              Control training parameters, start/stop sessions, and
              monitor progress through an intuitive interface.
            </p>
          </Card>

          <Card title="Model Management">
            <p className="text-gray-600">
              Save, load, and manage trained models. Compare different
              training runs and download results.
            </p>
          </Card>

          <Card title="Performance Analytics">
            <p className="text-gray-600">
              Analyze episode rewards, loss convergence, epsilon decay,
              and other key training metrics.
            </p>
          </Card>

          <Card title="Agent Testing">
            <p className="text-gray-600">
              Test trained agents and watch them perform in the CartPole
              environment with video playback.
            </p>
          </Card>

          <Card title="WebSocket Updates">
            <p className="text-gray-600">
              Get instant updates during training with WebSocket
              connections for seamless real-time experience.
            </p>
          </Card>
        </div>

        {/* Technical Overview */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Frontend Stack</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Next.js 14 with App Router</li>
                <li>• TypeScript for type safety</li>
                <li>• Tailwind CSS for styling</li>
                <li>• Chart.js for visualizations</li>
                <li>• WebSocket for real-time updates</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Backend Stack</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• FastAPI for high-performance API</li>
                <li>• PyTorch for DQN implementation</li>
                <li>• Gymnasium for CartPole environment</li>
                <li>• WebSocket for real-time communication</li>
                <li>• Experience replay and target networks</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
