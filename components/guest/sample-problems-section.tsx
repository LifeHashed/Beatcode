'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, ArrowRight } from 'lucide-react';

// Sample problems data - in a real app, this would come from your API
const sampleProblems = [
	{
		id: 1,
		title: 'Two Sum',
		difficulty: 'Easy',
		company: 'Amazon',
		url: 'https://leetcode.com/problems/two-sum/',
	},
	{
		id: 2,
		title: 'Add Two Numbers',
		difficulty: 'Medium',
		company: 'Microsoft',
		url: 'https://leetcode.com/problems/add-two-numbers/',
	},
	{
		id: 3,
		title: 'Longest Substring Without Repeating Characters',
		difficulty: 'Medium',
		company: 'Google',
		url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
	},
	{
		id: 4,
		title: 'Median of Two Sorted Arrays',
		difficulty: 'Hard',
		company: 'Meta',
		url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
	},
	{
		id: 5,
		title: 'Longest Palindromic Substring',
		difficulty: 'Medium',
		company: 'Apple',
		url: 'https://leetcode.com/problems/longest-palindromic-substring/',
	},
];

function getDifficultyColor(difficulty: string) {
	switch (difficulty) {
		case 'Easy':
			return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
		case 'Medium':
			return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
		case 'Hard':
			return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
		default:
			return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
	}
}

export function SampleProblemsSection() {
	const [displayedProblems, setDisplayedProblems] = useState(
		sampleProblems.slice(0, 3)
	);

	const refreshSamples = () => {
		// Shuffle and take 3 random problems
		const shuffled = [...sampleProblems].sort(() => Math.random() - 0.5);
		setDisplayedProblems(shuffled.slice(0, 3));
	};

	return (
		<section className="py-6 px-4 relative">
			<div className="container mx-auto relative z-10">
				<div className="text-center mb-6">
					<h2 className="text-xl md:text-2xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
						Sample Problems Preview
					</h2>
					<p className="text-sm text-muted-foreground max-w-xl mx-auto mb-3 font-medium">
						Get a taste of what BeatCode offers. Explore problems from top tech
						companies.
					</p>
					<Button
						variant="outline"
						size="sm"
						onClick={refreshSamples}
						className="hover:scale-105 transition-transform"
					>
						Show Different Problems
					</Button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
					{displayedProblems.map((problem) => (
						<Card
							key={problem.id}
							className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-md"
						>
							<CardHeader className="pb-2">
								<div className="flex justify-between items-start">
									<CardTitle className="text-sm line-clamp-2">
										{problem.title}
									</CardTitle>
									<a
										href={problem.url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary hover:text-primary/80"
									>
										<ExternalLink className="h-3 w-3" />
									</a>
								</div>
							</CardHeader>
							<CardContent className="pt-0">
								<div className="flex justify-between items-center">
									<Badge
										className={`${getDifficultyColor(
											problem.difficulty
										)} text-xs`}
									>
										{problem.difficulty}
									</Badge>
									<span className="text-xs text-muted-foreground">
										{problem.company}
									</span>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				<div className="text-center">
					<Button
						asChild
						size="lg"
						className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
					>
						<Link href="/guest/problems">
							View All Problems
							<ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}
