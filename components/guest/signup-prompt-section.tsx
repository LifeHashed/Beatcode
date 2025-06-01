import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';

const benefits = [
	'Save your progress and track completed problems',
	'Mark problems as favorites for quick access',
	'Add personal remarks and notes',
	'Access advanced filtering options'
];

export function SignupPromptSection() {
	return (
		<section className="py-6 px-4 relative">
			<div className="container mx-auto relative z-10">
				<Card className="max-w-2xl mx-auto border-0 shadow-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
					<CardContent className="p-6 text-center">
						<h2 className="text-xl md:text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
							Ready to Level Up Your Coding Journey?
						</h2>

						<p className="text-sm text-muted-foreground mb-4 font-medium">
							Want to save progress and mark problems? Join thousands of developers who use BeatCode to ace their interviews.
						</p>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 text-left max-w-lg mx-auto">
							{benefits.map((benefit, index) => (
								<div key={index} className="flex items-center space-x-2 group">
									<CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
									<span className="text-xs font-medium">{benefit}</span>
								</div>
							))}
						</div>

						<div className="flex flex-col sm:flex-row gap-2 justify-center">
							<Button
								asChild
								size="sm"
								className="text-sm px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all"
							>
								<Link href="/auth/register">
									Sign Up Now - It's Free
									<ArrowRight className="ml-1 h-3 w-3" />
								</Link>
							</Button>

							<Button
								asChild
								variant="outline"
								size="sm"
								className="text-sm px-4 py-2 rounded-md hover:scale-105 transition-transform"
							>
								<Link href="/auth/signin">Already have an account?</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}
