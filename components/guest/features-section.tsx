import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Filter, Heart, Target } from 'lucide-react';

const features = [
	{
		icon: BarChart3,
		title: 'Track Your Progress',
		description: 'Monitor your coding journey with detailed statistics and progress charts.'
	},
	{
		icon: Filter,
		title: 'Smart Filtering',
		description: 'Filter problems by company, tags, difficulty, and timeline to find exactly what you need.'
	},
	{
		icon: Heart,
		title: 'Favorites & Remarks',
		description: 'Save your favorite problems and add personal notes to remember key insights.'
	},
	{
		icon: Target,
		title: 'Goal Setting',
		description: 'Set and achieve coding goals with our built-in tracking system.'
	}
];

export function FeaturesSection() {
	return (
		<section className="py-8 px-4 relative">
			<div className="container mx-auto relative z-10">
				<div className="text-center mb-8">
					<h2 className="text-2xl md:text-3xl font-extrabold mb-3 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
						Platform Features
					</h2>
					<p className="text-sm text-muted-foreground max-w-lg mx-auto font-medium">
						Everything you need to excel in your coding interviews and beyond
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{features.map((feature, index) => (
						<Card key={index} className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105 group">
							<CardHeader className="pb-3">
								<div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-3 group-hover:rotate-12 transition-transform duration-300">
									<feature.icon className="h-4 w-4 text-white" />
								</div>
								<CardTitle className="text-base font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
									{feature.title}
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-0">
								<CardDescription className="text-xs leading-relaxed font-medium">
									{feature.description}
								</CardDescription>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
