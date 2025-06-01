import { prisma } from './prisma';

const sampleQuestions = [
  {
    title: "Two Sum",
    url: "https://leetcode.com/problems/two-sum/",
    difficulty: "EASY",
    company: "Google",
    timeline: "THIRTY_DAYS",
    topics: ["Array", "Hash Table"]
  },
  {
    title: "Add Two Numbers",
    url: "https://leetcode.com/problems/add-two-numbers/",
    difficulty: "MEDIUM",
    company: "Amazon",
    timeline: "THIRTY_DAYS",
    topics: ["Linked List", "Math"]
  },
  {
    title: "Longest Substring Without Repeating Characters",
    url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    difficulty: "MEDIUM",
    company: "Facebook",
    timeline: "THREE_MONTHS",
    topics: ["Hash Table", "String", "Sliding Window"]
  },
  {
    title: "Median of Two Sorted Arrays",
    url: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    difficulty: "HARD",
    company: "Microsoft",
    timeline: "SIX_MONTHS",
    topics: ["Array", "Binary Search", "Divide and Conquer"]
  },
  {
    title: "Reverse Integer",
    url: "https://leetcode.com/problems/reverse-integer/",
    difficulty: "EASY",
    company: "Apple",
    timeline: "THIRTY_DAYS",
    topics: ["Math"]
  }
];

export async function seedQuestions() {
  try {
    console.log('Starting to seed questions...');
    
    for (const questionData of sampleQuestions) {
      const { topics, ...questionFields } = questionData;
      
      // Create or find topics
      const topicConnections = [];
      for (const topicName of topics) {
        const topic = await prisma.topic.upsert({
          where: { name: topicName },
          update: {},
          create: { name: topicName }
        });
        topicConnections.push({ id: topic.id });
      }
      
      // Check if question already exists
      const existingQuestion = await prisma.question.findFirst({
        where: { title: questionFields.title }
      });
      
      if (!existingQuestion) {
        await prisma.question.create({
          data: {
            ...questionFields,
            topics: {
              connect: topicConnections
            }
          }
        });
        console.log(`Created question: ${questionFields.title}`);
      } else {
        console.log(`Question already exists: ${questionFields.title}`);
      }
    }
    
    console.log('Finished seeding questions!');
  } catch (error) {
    console.error('Error seeding questions:', error);
    throw error;
  }
}
