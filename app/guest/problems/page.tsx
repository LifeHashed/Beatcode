'use client';

import { useState, useEffect } from 'react';
import { GuestNavbar } from '@/components/guest/guest-navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Clock, Building, Users, Search, Shuffle, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

// Mock data for problems since API might not be working
const mockProblems = [
	{
		id: '1',
		title: 'Two Sum',
		difficulty: 'EASY' as const,
		company: 'Amazon',
		url: 'https://leetcode.com/problems/two-sum/',
		topics: [{ name: 'Array' }, { name: 'Hash Table' }],
		timeline: 'WITHIN_A_WEEK',
	},
	{
		id: '2',
		title: 'Add Two Numbers',
		difficulty: 'MEDIUM' as const,
		company: 'Microsoft',
		url: 'https://leetcode.com/problems/add-two-numbers/',
		topics: [{ name: 'Linked List' }, { name: 'Math' }],
		timeline: 'WITHIN_A_MONTH',
	},
	{
		id: '3',
		title: 'Longest Substring Without Repeating Characters',
		difficulty: 'MEDIUM' as const,
		company: 'Google',
		url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
		topics: [{ name: 'String' }, { name: 'Sliding Window' }],
		timeline: 'WITHIN_A_WEEK',
	},
	{
		id: '4',
		title: 'Median of Two Sorted Arrays',
		difficulty: 'HARD' as const,
		company: 'Meta',
		url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
		topics: [{ name: 'Array' }, { name: 'Binary Search' }, { name: 'Divide and Conquer' }],
		timeline: 'WITHIN_A_MONTH',
	},
	{
		id: '5',
		title: 'Longest Palindromic Substring',
		difficulty: 'MEDIUM' as const,
		company: 'Apple',
		url: 'https://leetcode.com/problems/longest-palindromic-substring/',
		topics: [{ name: 'String' }, { name: 'Dynamic Programming' }],
		timeline: 'WITHIN_A_WEEK',
	},
	{
		id: '6',
		title: 'Valid Parentheses',
		difficulty: 'EASY' as const,
		company: 'Netflix',
		url: 'https://leetcode.com/problems/valid-parentheses/',
		topics: [{ name: 'String' }, { name: 'Stack' }],
		timeline: 'WITHIN_A_WEEK',
	},
];

interface Problem {
	id: string;
	title: string;
	difficulty: 'EASY' | 'MEDIUM' | 'HARD';
	company: string;
	url: string;
	topics: { name: string }[];
	timeline: string;
}

export default function GuestProblemsPage() {
	const [problems, setProblems] = useState<Problem[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
	const [companyFilter, setCompanyFilter] = useState<string>('ALL');
	const [searchTerm, setSearchTerm] = useState('');
	const [questionOfDay, setQuestionOfDay] = useState<Problem | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [sortOption, setSortOption] = useState<string>('title-asc');
	const [totalProblemsCount, setTotalProblemsCount] = useState(0); // Track total problems in database
	const problemsPerPage = 200;
	const GUEST_PROBLEMS_LIMIT = 500; // Limit for guest users
	const [companySearchOpen, setCompanySearchOpen] = useState(false);

	// Set question of the day immediately with mock data
	useEffect(() => {
		const today = new Date();
		const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
		const questionIndex = dayOfYear % mockProblems.length;
		setQuestionOfDay(mockProblems[questionIndex]);
	}, []);

	useEffect(() => {
		fetchProblems();
	}, []);

	const fetchProblems = async () => {
		setLoading(true);
		try {
			const response = await fetch('/api/questions/public');
			
			if (response.ok) {
				const data = await response.json();
				
				// Handle the response structure
				const questionsList = data.questions || [];
				
				if (questionsList.length > 0) {
					setTotalProblemsCount(questionsList.length); // Store total count
					// Limit to first 500 problems for guest users
					const limitedProblems = questionsList.slice(0, GUEST_PROBLEMS_LIMIT);
					setProblems(limitedProblems);
					
					// Update question of the day with limited data
					const today = new Date();
					const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
					const questionIndex = dayOfYear % limitedProblems.length;
					setQuestionOfDay(limitedProblems[questionIndex]);
				} else {
					// Fallback to mock data if no questions from API
					setTotalProblemsCount(mockProblems.length);
					setProblems(mockProblems);
				}
			} else {
				console.warn('API response not ok, using mock data');
				setTotalProblemsCount(mockProblems.length);
				setProblems(mockProblems);
			}
		} catch (error) {
			console.error('Error fetching problems:', error);
			// Always fallback to mock data on error
			setTotalProblemsCount(mockProblems.length);
			setProblems(mockProblems);
		} finally {
			setLoading(false);
		}
	};

	const getRandomQuestion = () => {
		if (filteredProblems.length > 0) {
			const randomIndex = Math.floor(Math.random() * filteredProblems.length);
			const randomProblem = filteredProblems[randomIndex];
			window.open(randomProblem.url, '_blank');
		}
	};

	const filteredProblems = problems.filter(problem => {
		const matchesDifficulty = filter === 'ALL' || problem.difficulty === filter;
		const matchesCompany = companyFilter === 'ALL' || problem.company.toLowerCase().includes(companyFilter.toLowerCase());
		const matchesSearch = searchTerm === '' || problem.title.toLowerCase().includes(searchTerm.toLowerCase());
		return matchesDifficulty && matchesCompany && matchesSearch;
	}).sort((a, b) => {
		const [sortBy, sortOrder] = sortOption.split('-');
		let valueA, valueB;
		
		switch (sortBy) {
			case 'title':
				valueA = a.title.toLowerCase();
				valueB = b.title.toLowerCase();
				break;
			case 'difficulty':
				const difficultyOrder = { 'EASY': 1, 'MEDIUM': 2, 'HARD': 3 };
				valueA = difficultyOrder[a.difficulty];
				valueB = difficultyOrder[b.difficulty];
				break;
			case 'company':
				valueA = a.company.toLowerCase();
				valueB = b.company.toLowerCase();
				break;
			default:
				valueA = a.title.toLowerCase();
				valueB = b.title.toLowerCase();
		}

		// For string values (title, company), use localeCompare for proper alphabetical sorting
		if (sortBy === 'title' || sortBy === 'company') {
			if (sortOrder === 'asc') {
				return valueA.localeCompare(valueB);
			} else {
				return valueB.localeCompare(valueA);
			}
		} else {
			// For numeric values (difficulty)
			if (sortOrder === 'asc') {
				return valueA - valueB;
			} else {
				return valueB - valueA;
			}
		}
	});

	const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);
	const startIndex = (currentPage - 1) * problemsPerPage;
	const endIndex = startIndex + problemsPerPage;
	const displayedProblems = filteredProblems.slice(startIndex, endIndex);

	// Reset to first page when filters or sort change
	useEffect(() => {
		setCurrentPage(1);
	}, [filter, companyFilter, searchTerm, sortOption]);

	const companies = [...new Set(problems.map(p => p.company))];

	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case 'EASY': return 'bg-green-100 text-green-800';
			case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
			case 'HARD': return 'bg-red-100 text-red-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	};

	const formatTimeline = (timeline: string) => {
		switch (timeline) {
			case 'WITHIN_A_WEEK':
				return 'Within a week';
			case 'WITHIN_A_MONTH':
				return 'Within a month';
			case 'MORE_THAN_SIX_MONTHS':
				return 'More than 6 months';
			case 'WITHIN_THREE_MONTHS':
				return 'Within 3 months';
			case 'WITHIN_SIX_MONTHS':
				return 'Within 6 months';
			default:
				return timeline.replace(/_/g, ' ').toLowerCase();
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
			{/* Animated background */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-1/2 -left-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/8 to-purple-400/8 rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute -bottom-1/2 -right-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/8 to-pink-400/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
				<div className="absolute top-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-cyan-400/6 to-blue-400/6 rounded-full blur-2xl animate-bounce delay-500"></div>
				<div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gradient-to-r from-indigo-400/6 to-purple-400/6 rounded-full blur-2xl animate-bounce delay-1500"></div>
			</div>

			<GuestNavbar />
			
			<div className="container mx-auto py-4 px-4 pt-20 relative z-10">
				{/* Question of the Day & Random Question */}
				<div className="grid md:grid-cols-2 gap-2 mb-4">
					{questionOfDay && (
						<Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg">
							<CardContent className="p-3">
								<div className="flex items-center gap-2 mb-2">
									<Calendar className="h-3 w-3" />
									<span className="text-xs font-semibold">Question of the Day</span>
								</div>
								<h3 className="font-semibold mb-1 text-xs">{questionOfDay.title}</h3>
								<div className="flex items-center gap-2 mb-2">
									<Badge className="bg-white/20 text-white border-white/30 text-xs py-0 px-1">
										{questionOfDay.difficulty}
									</Badge>
									<span className="text-xs opacity-90">{questionOfDay.company}</span>
								</div>
								<Button asChild variant="secondary" size="sm" className="h-6 text-xs">
									<a href={questionOfDay.url} target="_blank" rel="noopener noreferrer">
										<ExternalLink className="h-2 w-2 mr-1" />
										Solve
									</a>
								</Button>
							</CardContent>
						</Card>
					)}

					<Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg">
						<CardContent className="p-3">
							<div className="flex items-center gap-2 mb-2">
								<Shuffle className="h-3 w-3" />
								<span className="text-xs font-semibold">Random Challenge</span>
							</div>
							<p className="text-xs opacity-90 mb-2">Pick a random problem to solve!</p>
							<Button 
								onClick={getRandomQuestion} 
								variant="secondary" 
								size="sm"
								disabled={filteredProblems.length === 0}
								className="h-6 text-xs"
							>
								<Shuffle className="h-2 w-2 mr-1" />
								Random
							</Button>
						</CardContent>
					</Card>
				</div>

				{/* Header */}
				<div className="mb-4">
					<h1 className="text-xl md:text-2xl font-black mb-1 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
						Coding Problems
					</h1>
					<p className="text-xs text-muted-foreground font-medium">
						Practice coding problems to improve your skills
					</p>
				</div>

				{/* Filters */}
				<Card className="mb-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-lg">
					<CardContent className="p-3">
						<div className="grid grid-cols-2 md:grid-cols-5 gap-2">
							{/* Search */}
							<div className="relative col-span-2 md:col-span-1">
								<Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3" />
								<Input
									placeholder="Search..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-6 h-7 text-xs"
								/>
							</div>

							{/* Difficulty Filter */}
							<Select value={filter} onValueChange={(value) => setFilter(value as any)}>
								<SelectTrigger className="h-7 text-xs">
									<SelectValue placeholder="Difficulty" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ALL">All</SelectItem>
									<SelectItem value="EASY">Easy</SelectItem>
									<SelectItem value="MEDIUM">Medium</SelectItem>
									<SelectItem value="HARD">Hard</SelectItem>
								</SelectContent>
							</Select>

							{/* Company Filter with Search */}
							<Popover open={companySearchOpen} onOpenChange={setCompanySearchOpen}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										role="combobox"
										aria-expanded={companySearchOpen}
										className="h-7 justify-between text-xs font-normal"
									>
										{companyFilter === 'ALL' ? 'All Companies' : companyFilter}
										<Search className="ml-2 h-3 w-3 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-[200px] p-0">
									<Command>
										<CommandInput placeholder="Search companies..." className="h-8 text-xs" />
										<CommandList>
											<CommandEmpty>No company found.</CommandEmpty>
											<CommandGroup className="max-h-[200px] overflow-y-auto">
												<CommandItem
													value="ALL"
													onSelect={() => {
														setCompanyFilter('ALL');
														setCompanySearchOpen(false);
													}}
													className="text-xs"
												>
													All Companies
												</CommandItem>
												{companies.map((company) => (
													<CommandItem
														key={company}
														value={company}
														onSelect={() => {
															setCompanyFilter(company);
															setCompanySearchOpen(false);
														}}
														className="text-xs"
													>
														{company}
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>

							{/* Combined Sort Options */}
							<Select value={sortOption} onValueChange={setSortOption}>
								<SelectTrigger className="h-7 text-xs">
									<SelectValue placeholder="Sort by" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="title-asc">Title A-Z</SelectItem>
									<SelectItem value="title-desc">Title Z-A</SelectItem>
									<SelectItem value="company-asc">Company A-Z</SelectItem>
									<SelectItem value="company-desc">Company Z-A</SelectItem>
									<SelectItem value="difficulty-asc">Easy to Hard</SelectItem>
									<SelectItem value="difficulty-desc">Hard to Easy</SelectItem>
								</SelectContent>
							</Select>

							{/* Guest Notice - Compact */}
							<div className="col-span-2 md:col-span-1 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 rounded px-2 py-1">
								<Users className="h-3 w-3 text-blue-600" />
								<span className="text-xs text-blue-800 dark:text-blue-200 font-medium">Guest</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Pagination Info */}
				<div className="mb-3 flex justify-between items-center">
					<p className="text-xs text-muted-foreground">
						Showing {startIndex + 1}-{Math.min(endIndex, filteredProblems.length)} of {filteredProblems.length} problems
						{totalProblemsCount > GUEST_PROBLEMS_LIMIT && (
							<span className="text-orange-600 dark:text-orange-400 font-medium">
								{" "}(Limited view - {totalProblemsCount} total available)
							</span>
						)}
					</p>
					<p className="text-xs text-muted-foreground">
						Page {currentPage} of {totalPages}
					</p>
				</div>

				{/* Guest Limitation Notice */}
				{totalProblemsCount > GUEST_PROBLEMS_LIMIT && (
					<Card className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="flex-shrink-0">
										<Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
									</div>
									<div>
										<h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
											Viewing Limited Problems
										</h3>
										<p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
											You're seeing {GUEST_PROBLEMS_LIMIT} out of {totalProblemsCount} available problems. 
											Sign up for free to access all coding challenges!
										</p>
									</div>
								</div>
								<div className="flex gap-2">
									<Button size="sm" variant="outline" asChild className="text-xs">
										<a href="/auth/signin">Sign In</a>
									</Button>
									<Button size="sm" asChild className="text-xs">
										<a href="/auth/signup">Sign Up</a>
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Problems List */}
				<div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg border-0 shadow-lg mb-4">
					{loading ? (
						<div className="flex justify-center py-4">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
						</div>
					) : (
						<div className="divide-y divide-slate-200 dark:divide-slate-700">
							{displayedProblems.map((problem, index) => (
								<div 
									key={problem.id} 
									className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 group hover:scale-[1.005]"
									style={{animationDelay: `${index * 50}ms`}}
								>
									<div className="flex items-center justify-between">
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
													{problem.title}
												</h3>
												<Badge className={`${getDifficultyColor(problem.difficulty)} text-xs py-0 px-1 flex-shrink-0`}>
													{problem.difficulty}
												</Badge>
											</div>
											<div className="flex items-center gap-3 text-xs text-muted-foreground">
												<span className="flex items-center gap-1">
													<Building className="h-2 w-2" />
													{problem.company}
												</span>
												<span className="flex items-center gap-1">
													<Clock className="h-2 w-2" />
													{formatTimeline(problem.timeline)}
												</span>
												<div className="flex flex-wrap gap-1">
													{problem.topics?.map((topic) => (
														<Badge key={topic.name} variant="secondary" className="text-xs py-0 px-1">
															{topic.name}
														</Badge>
													))}
												</div>
											</div>
										</div>
										<Button variant="outline" size="sm" asChild className="h-6 text-xs ml-2 opacity-70 group-hover:opacity-100 transition-opacity">
											<a href={problem.url} target="_blank" rel="noopener noreferrer">
												<ExternalLink className="h-2 w-2 mr-1" />
												Solve
											</a>
										</Button>
									</div>
								</div>
							))}
						</div>
					)}

					{displayedProblems.length === 0 && !loading && (
						<div className="text-center py-6">
							<p className="text-muted-foreground text-xs">No problems found for the selected filters.</p>
						</div>
					)}
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex justify-center items-center gap-2">
						<Button 
							variant="outline" 
							size="sm" 
							onClick={() => setCurrentPage(1)}
							disabled={currentPage === 1}
							className="h-7 text-xs"
						>
							First
						</Button>
						
						<Button 
							variant="outline" 
							size="sm" 
							onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
							disabled={currentPage === 1}
							className="h-7 text-xs"
						>
							Previous
						</Button>
						
						<div className="flex gap-1">
							{[...Array(Math.min(5, totalPages))].map((_, i) => {
								let pageNum;
								if (totalPages <= 5) {
									pageNum = i + 1;
								} else if (currentPage <= 3) {
									pageNum = i + 1;
								} else if (currentPage >= totalPages - 2) {
									pageNum = totalPages - 4 + i;
								} else {
									pageNum = currentPage - 2 + i;
								}
								
								return (
									<Button
										key={pageNum}
										variant={currentPage === pageNum ? "default" : "outline"}
										size="sm"
										onClick={() => setCurrentPage(pageNum)}
										className="h-7 w-7 text-xs p-0"
									>
										{pageNum}
									</Button>
								);
							})}
						</div>
						
						<Button 
							variant="outline" 
							size="sm" 
							onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
							disabled={currentPage === totalPages}
							className="h-7 text-xs"
						>
							Next
						</Button>

						<Button 
							variant="outline" 
							size="sm" 
							onClick={() => setCurrentPage(totalPages)}
							disabled={currentPage === totalPages}
							className="h-7 text-xs"
						>
							Last
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
