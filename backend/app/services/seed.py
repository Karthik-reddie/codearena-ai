from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.challenge import Challenge
from app.models.roadmap import Roadmap
from app.models.user import User, UserRole


async def seed_database(db: AsyncSession):
    from sqlalchemy import select

    existing = await db.execute(select(User).limit(1))
    if existing.scalar_one_or_none():
        return

    admin = User(
        username="admin",
        email="admin@codearena.ai",
        hashed_password=hash_password("Admin@123"),
        full_name="Admin User",
        role=UserRole.ADMIN,
        is_verified=True,
        xp=5000,
        level=10,
    )
    student = User(
        username="demo_student",
        email="student@codearena.ai",
        hashed_password=hash_password("Student@123"),
        full_name="Demo Student",
        role=UserRole.STUDENT,
        is_verified=True,
        xp=1250,
        level=4,
        streak_days=7,
        problems_solved=15,
        battles_won=3,
        battles_played=5,
    )
    db.add_all([admin, student])
    await db.flush()

    challenges = [
        Challenge(
            title="Two Sum",
            slug="two-sum",
            description="Given an array of integers `nums` and an integer `target`, return indices of the two numbers that add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
            difficulty="easy",
            tags=["array", "hash-table"],
            constraints="2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
            examples=[
                {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "Because nums[0] + nums[1] == 9"},
                {"input": "nums = [3,2,4], target = 6", "output": "[1,2]"},
            ],
            test_cases=[
                {"input": [[2, 7, 11, 15], 9], "expected": [0, 1]},
                {"input": [[3, 2, 4], 6], "expected": [1, 2]},
                {"input": [[3, 3], 6], "expected": [0, 1]},
            ],
            starter_code={
                "python": "def two_sum(nums, target):\n    # Write your solution here\n    pass",
                "javascript": "function twoSum(nums, target) {\n    // Write your solution here\n}",
            },
            solution="def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i",
            hints=["Try using a hash map", "For each element, check if target - element exists in the map"],
            xp_reward=10,
            time_limit_seconds=300,
            created_by=admin.id,
        ),
        Challenge(
            title="Reverse Linked List",
            slug="reverse-linked-list",
            description="Given the head of a singly linked list, reverse the list, and return the reversed list.",
            difficulty="easy",
            tags=["linked-list", "recursion"],
            constraints="The number of nodes in the list is [0, 5000].\n-5000 <= Node.val <= 5000",
            examples=[
                {"input": "head = [1,2,3,4,5]", "output": "[5,4,3,2,1]"},
                {"input": "head = [1,2]", "output": "[2,1]"},
            ],
            test_cases=[
                {"input": [[1, 2, 3, 4, 5]], "expected": [5, 4, 3, 2, 1]},
                {"input": [[1, 2]], "expected": [2, 1]},
            ],
            starter_code={
                "python": "def reverse_list(arr):\n    # Write your solution here\n    pass",
            },
            hints=["Use three pointers: prev, curr, next", "Think about what changes at each step"],
            xp_reward=10,
            created_by=admin.id,
        ),
        Challenge(
            title="Valid Parentheses",
            slug="valid-parentheses",
            description="Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
            difficulty="easy",
            tags=["stack", "string"],
            test_cases=[
                {"input": ["()"], "expected": True},
                {"input": ["()[]{}"], "expected": True},
                {"input": ["(]"], "expected": False},
                {"input": ["([)]"], "expected": False},
                {"input": ["{[]}"], "expected": True},
            ],
            starter_code={
                "python": "def is_valid(s):\n    # Write your solution here\n    pass",
            },
            hints=["Use a stack", "Push opening brackets, pop for closing ones"],
            xp_reward=10,
            created_by=admin.id,
        ),
        Challenge(
            title="Maximum Subarray",
            slug="maximum-subarray",
            description="Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
            difficulty="medium",
            tags=["array", "dynamic-programming", "divide-and-conquer"],
            test_cases=[
                {"input": [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], "expected": 6},
                {"input": [[1]], "expected": 1},
                {"input": [[5, 4, -1, 7, 8]], "expected": 23},
            ],
            starter_code={
                "python": "def max_subarray(nums):\n    # Write your solution here\n    pass",
            },
            hints=["Think about Kadane's algorithm", "Keep track of current sum and max sum"],
            xp_reward=20,
            time_limit_seconds=300,
            created_by=admin.id,
        ),
        Challenge(
            title="Merge Two Sorted Lists",
            slug="merge-two-sorted-lists",
            description="You are given two sorted arrays. Merge them into a single sorted array.",
            difficulty="easy",
            tags=["linked-list", "recursion"],
            test_cases=[
                {"input": [[1, 2, 4], [1, 3, 4]], "expected": [1, 1, 2, 3, 4, 4]},
                {"input": [[], []], "expected": []},
                {"input": [[], [0]], "expected": [0]},
            ],
            starter_code={
                "python": "def merge_sorted(list1, list2):\n    # Write your solution here\n    pass",
            },
            hints=["Use two pointers", "Compare elements from both lists"],
            xp_reward=10,
            created_by=admin.id,
        ),
        Challenge(
            title="Longest Common Subsequence",
            slug="longest-common-subsequence",
            description="Given two strings `text1` and `text2`, return the length of their longest common subsequence. If there is no common subsequence, return 0.",
            difficulty="medium",
            tags=["string", "dynamic-programming"],
            test_cases=[
                {"input": ["abcde", "ace"], "expected": 3},
                {"input": ["abc", "abc"], "expected": 3},
                {"input": ["abc", "def"], "expected": 0},
            ],
            starter_code={
                "python": "def longest_common_subsequence(text1, text2):\n    # Write your solution here\n    pass",
            },
            hints=["Use 2D dynamic programming", "Build a table comparing characters"],
            xp_reward=25,
            created_by=admin.id,
        ),
        Challenge(
            title="Binary Search",
            slug="binary-search",
            description="Given a sorted array of integers `nums` and a target value, return the index of the target if found, otherwise return -1.",
            difficulty="easy",
            tags=["array", "binary-search"],
            test_cases=[
                {"input": [[-1, 0, 3, 5, 9, 12], 9], "expected": 4},
                {"input": [[-1, 0, 3, 5, 9, 12], 2], "expected": -1},
            ],
            starter_code={
                "python": "def binary_search(nums, target):\n    # Write your solution here\n    pass",
            },
            hints=["Use two pointers: left and right", "Compare middle element with target"],
            xp_reward=10,
            created_by=admin.id,
        ),
        Challenge(
            title="Coin Change",
            slug="coin-change",
            description="Given an array of coin denominations and a total amount, find the minimum number of coins needed to make up that amount. If it cannot be made up, return -1.",
            difficulty="medium",
            tags=["dynamic-programming", "greedy"],
            test_cases=[
                {"input": [[1, 5, 10, 25], 30], "expected": 2},
                {"input": [[2], 3], "expected": -1},
                {"input": [[1], 0], "expected": 0},
            ],
            starter_code={
                "python": "def coin_change(coins, amount):\n    # Write your solution here\n    pass",
            },
            hints=["Use bottom-up DP", "Build solutions from amount 0 to target"],
            xp_reward=25,
            created_by=admin.id,
        ),
        Challenge(
            title="N-Queens",
            slug="n-queens",
            description="Place N queens on an N×N chessboard such that no two queens attack each other. Return the number of valid configurations.",
            difficulty="hard",
            tags=["backtracking", "recursion"],
            test_cases=[
                {"input": [4], "expected": 2},
                {"input": [1], "expected": 1},
                {"input": [8], "expected": 92},
            ],
            starter_code={
                "python": "def n_queens(n):\n    # Write your solution here\n    pass",
            },
            hints=["Use backtracking", "Track columns and diagonals"],
            xp_reward=50,
            time_limit_seconds=600,
            created_by=admin.id,
        ),
        Challenge(
            title="LRU Cache",
            slug="lru-cache",
            description="Design a data structure that follows the constraints of a Least Recently Used (LRU) Cache. Implement a function that takes operations and returns results.",
            difficulty="hard",
            tags=["hash-table", "design", "linked-list"],
            test_cases=[],
            starter_code={
                "python": "class LRUCache:\n    def __init__(self, capacity):\n        pass\n\n    def get(self, key):\n        pass\n\n    def put(self, key, value):\n        pass",
            },
            hints=["Use OrderedDict or HashMap + Doubly Linked List"],
            xp_reward=50,
            created_by=admin.id,
        ),
    ]
    db.add_all(challenges)

    roadmaps = [
        Roadmap(
            title="Data Structures & Algorithms",
            slug="dsa",
            description="Master fundamental data structures and algorithms for coding interviews",
            icon="🧮",
            color="#6366f1",
            total_topics=20,
            topics=[
                {"id": "arrays", "title": "Arrays & Strings", "description": "Learn array manipulation and string algorithms", "order": 1},
                {"id": "hashing", "title": "Hash Tables", "description": "Master hash maps and sets", "order": 2},
                {"id": "linked-lists", "title": "Linked Lists", "description": "Singly and doubly linked lists", "order": 3},
                {"id": "stacks-queues", "title": "Stacks & Queues", "description": "LIFO and FIFO data structures", "order": 4},
                {"id": "trees", "title": "Binary Trees", "description": "Tree traversal and manipulation", "order": 5},
                {"id": "bst", "title": "Binary Search Trees", "description": "BST operations and balancing", "order": 6},
                {"id": "heaps", "title": "Heaps & Priority Queues", "description": "Min/max heaps and applications", "order": 7},
                {"id": "graphs", "title": "Graphs", "description": "BFS, DFS, and graph algorithms", "order": 8},
                {"id": "sorting", "title": "Sorting Algorithms", "description": "Various sorting techniques", "order": 9},
                {"id": "searching", "title": "Searching Algorithms", "description": "Binary search and variants", "order": 10},
                {"id": "recursion", "title": "Recursion", "description": "Recursive problem solving", "order": 11},
                {"id": "backtracking", "title": "Backtracking", "description": "Constraint satisfaction problems", "order": 12},
                {"id": "dp-basics", "title": "Dynamic Programming Basics", "description": "Memoization and tabulation", "order": 13},
                {"id": "dp-advanced", "title": "Advanced DP", "description": "Complex DP patterns", "order": 14},
                {"id": "greedy", "title": "Greedy Algorithms", "description": "Optimal substructure problems", "order": 15},
                {"id": "bit-manipulation", "title": "Bit Manipulation", "description": "Bitwise operations and tricks", "order": 16},
                {"id": "tries", "title": "Tries", "description": "Prefix trees and applications", "order": 17},
                {"id": "segment-trees", "title": "Segment Trees", "description": "Range query data structures", "order": 18},
                {"id": "union-find", "title": "Union Find", "description": "Disjoint set data structure", "order": 19},
                {"id": "advanced-graphs", "title": "Advanced Graphs", "description": "Shortest paths, MST, topological sort", "order": 20},
            ],
        ),
        Roadmap(
            title="Frontend Development",
            slug="frontend",
            description="Build modern web applications with React, TypeScript, and more",
            icon="🎨",
            color="#f43f5e",
            total_topics=15,
            topics=[
                {"id": "html-css", "title": "HTML & CSS Fundamentals", "order": 1},
                {"id": "javascript", "title": "JavaScript Essentials", "order": 2},
                {"id": "typescript", "title": "TypeScript", "order": 3},
                {"id": "react-basics", "title": "React Basics", "order": 4},
                {"id": "react-hooks", "title": "React Hooks", "order": 5},
                {"id": "state-management", "title": "State Management", "order": 6},
                {"id": "routing", "title": "Routing", "order": 7},
                {"id": "api-integration", "title": "API Integration", "order": 8},
                {"id": "testing", "title": "Testing", "order": 9},
                {"id": "css-frameworks", "title": "CSS Frameworks", "order": 10},
                {"id": "performance", "title": "Performance Optimization", "order": 11},
                {"id": "accessibility", "title": "Accessibility", "order": 12},
                {"id": "pwa", "title": "Progressive Web Apps", "order": 13},
                {"id": "deployment", "title": "Deployment", "order": 14},
                {"id": "advanced-patterns", "title": "Advanced Patterns", "order": 15},
            ],
        ),
        Roadmap(
            title="Backend Development",
            slug="backend",
            description="Learn server-side development with Python, databases, and APIs",
            icon="⚙️",
            color="#10b981",
            total_topics=15,
            topics=[
                {"id": "python-basics", "title": "Python Fundamentals", "order": 1},
                {"id": "rest-apis", "title": "REST API Design", "order": 2},
                {"id": "databases", "title": "Database Design", "order": 3},
                {"id": "sql", "title": "SQL Mastery", "order": 4},
                {"id": "orm", "title": "ORM (SQLAlchemy)", "order": 5},
                {"id": "auth", "title": "Authentication & Authorization", "order": 6},
                {"id": "caching", "title": "Caching (Redis)", "order": 7},
                {"id": "websockets", "title": "WebSockets", "order": 8},
                {"id": "testing", "title": "Testing APIs", "order": 9},
                {"id": "docker", "title": "Docker", "order": 10},
                {"id": "ci-cd", "title": "CI/CD", "order": 11},
                {"id": "monitoring", "title": "Monitoring & Logging", "order": 12},
                {"id": "security", "title": "Security Best Practices", "order": 13},
                {"id": "microservices", "title": "Microservices", "order": 14},
                {"id": "system-design", "title": "System Design", "order": 15},
            ],
        ),
        Roadmap(
            title="AI & Machine Learning",
            slug="ai-ml",
            description="Explore artificial intelligence and machine learning concepts",
            icon="🤖",
            color="#f59e0b",
            total_topics=12,
            topics=[
                {"id": "python-ml", "title": "Python for ML", "order": 1},
                {"id": "numpy-pandas", "title": "NumPy & Pandas", "order": 2},
                {"id": "data-viz", "title": "Data Visualization", "order": 3},
                {"id": "statistics", "title": "Statistics & Probability", "order": 4},
                {"id": "linear-regression", "title": "Linear Regression", "order": 5},
                {"id": "classification", "title": "Classification", "order": 6},
                {"id": "clustering", "title": "Clustering", "order": 7},
                {"id": "neural-networks", "title": "Neural Networks", "order": 8},
                {"id": "cnn", "title": "Convolutional Neural Networks", "order": 9},
                {"id": "nlp", "title": "Natural Language Processing", "order": 10},
                {"id": "transformers", "title": "Transformers & LLMs", "order": 11},
                {"id": "deployment-ml", "title": "ML Deployment", "order": 12},
            ],
        ),
    ]
    db.add_all(roadmaps)
    await db.flush()
