"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Filter, X } from "lucide-react";

interface QuestionFiltersProps {
  onFilterChange: (filters: any) => void;
}

export function QuestionFilters({ onFilterChange }: QuestionFiltersProps) {
  const [difficulty, setDifficulty] = useState<string>("");
  const [companies, setCompanies] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<any>(null);
  const [availableCompanies, setAvailableCompanies] = useState<string[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const filters = {
      difficulty: difficulty || undefined,
      companies: companies.length > 0 ? companies : undefined,
      topics: topics.length > 0 ? topics : undefined,
      dateRange: dateRange || undefined,
    };
    onFilterChange(filters);
  }, [difficulty, companies, topics, dateRange, onFilterChange]);

  const fetchFilterOptions = async () => {
    try {
      const [companiesRes, topicsRes] = await Promise.all([
        fetch("/api/filters/companies"),
        fetch("/api/filters/topics"),
      ]);

      if (companiesRes.ok) {
        const companiesData = await companiesRes.json();
        setAvailableCompanies(companiesData.companies.map((c: any) => c.name));
      }

      if (topicsRes.ok) {
        const topicsData = await topicsRes.json();
        setAvailableTopics(topicsData.topics.map((t: any) => t.name));
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const clearFilters = () => {
    setDifficulty("");
    setCompanies([]);
    setTopics([]);
    setDateRange(null);
  };

  const hasActiveFilters = difficulty || companies.length > 0 || topics.length > 0 || dateRange;

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Difficulty Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Difficulty</label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Companies Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Companies</label>
          <MultiSelect
            options={availableCompanies.map(company => ({ label: company, value: company }))}
            selected={companies}
            onChange={setCompanies}
            placeholder="Select companies"
          />
          {companies.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {companies.map(company => (
                <Badge key={company} variant="secondary" className="text-xs">
                  {company}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Topics Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Topics</label>
          <MultiSelect
            options={availableTopics.map(topic => ({ label: topic, value: topic }))}
            selected={topics}
            onChange={setTopics}
            placeholder="Select topics"
          />
          {topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {topics.map(topic => (
                <Badge key={topic} variant="outline" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Date Range</label>
          <DateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
          />
        </div>
      </CardContent>
    </Card>
  );
}