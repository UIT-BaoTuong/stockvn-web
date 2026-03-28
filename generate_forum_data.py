#!/usr/bin/env python3
"""
Generate virtual user accounts and stock forum discussions with realistic interactions.
This script creates:
1. Virtual user accounts
2. Stock ticker threads based on news
3. Comments/interactions between accounts
"""

import requests
import time
import random
from datetime import datetime, timedelta

# Configuration
AUTH_BASE_URL = "http://localhost:8080"
FORUM_BASE_URL = "http://localhost:8081"

# Virtual users to create (Vietnamese names)
VIRTUAL_USERS = [
    {"username": "nguyenhunga", "email": "nguyenhunga@traders.vn", "password": "Pass123456", "role": "trader"},
    {"username": "trannam2020", "email": "trannam2020@traders.vn", "password": "Pass123456", "role": "trader"},
    {"username": "phamtuan_dev", "email": "phamtuan.dev@analysts.vn", "password": "Pass123456", "role": "analyst"},
    {"username": "hoanglinh88", "email": "hoanglinh88@investors.vn", "password": "Pass123456", "role": "investor"},
    {"username": "vuhung_trader", "email": "vuhung.trader@traders.vn", "password": "Pass123456", "role": "trader"},
    {"username": "dangtuanabc", "email": "dangtuanabc@analysts.vn", "password": "Pass123456", "role": "analyst"},
    {"username": "buidung_bull", "email": "buidung.bull@traders.vn", "password": "Pass123456", "role": "trader"},
    {"username": "duonghai_tech", "email": "duonghai.tech@traders.vn", "password": "Pass123456", "role": "trader"},
    {"username": "lybinhdev", "email": "lybinhdev@analysts.vn", "password": "Pass123456", "role": "analyst"},
    {"username": "kieuulinh_fin", "email": "kieuulinh.fin@investors.vn", "password": "Pass123456", "role": "investor"},
]

# Stock tickers with news context
STOCK_TICKERS = {
    "AAPL": {
        "company": "Apple",
        "thread_title": "AAPL - Apple Inc. Discussion & News",
        "initial_post": """Apple's fiscal Q1 results exceeded expectations with strong iPhone 15 sales in Greater China. 
        Services revenue also reached all-time highs. The company's focus on AI features and 
        optimization suggests strong growth potential for Q2. Supply chain improvements have reduced 
        production delays significantly."""
    },
    "GOOGL": {
        "company": "Google/Alphabet",
        "thread_title": "GOOGL - Alphabet Inc. Market Analysis",
        "initial_post": """Alphabet's AI initiatives continue to show strong promise. The new Gemini model 
        outperforms competitors in multiple benchmarks. Ad revenue remains robust with YouTube shorts 
        gaining advertiser interest. Cloud segment shows accelerating growth quarter-over-quarter."""
    },
    "MSFT": {
        "company": "Microsoft",
        "thread_title": "MSFT - Microsoft Trading Discussion",
        "initial_post": """Microsoft's enterprise segment continues to shine with strong Azure growth. 
        The partnership with OpenAI is driving innovation in productivity tools. Windows ecosystem 
        remains stable while cloud services see double-digit growth. Recent earnings beat analyst 
        expectations."""
    },
    "NVDA": {
        "company": "NVIDIA",
        "thread_title": "NVDA - NVIDIA Corporation",
        "initial_post": """NVIDIA dominates the AI chip market with record demand for H100 GPUs. 
        Supply constraints continue to ease while pricing remains strong. New Blackwell architecture 
        shows significant performance improvements. Data center revenue growth trajectory is remarkable."""
    },
    "TSLA": {
        "company": "Tesla",
        "thread_title": "TSLA - Tesla Inc. Discussion",
        "initial_post": """Tesla delivered record vehicles in Q4 despite production challenges. 
        Cybertruck ramp-up continues with improving margins. New battery technology promises 
        increased range and reduced costs. Global expansion in Mexico and Germany on track."""
    },
    "META": {
        "company": "Meta Platforms",
        "thread_title": "META - Meta (Facebook) Stock Talk",
        "initial_post": """Meta's AI efficiency improvements are cutting costs significantly. 
        Reels engagement continues to grow, improving ad monetization. VR/Metaverse division shows 
        signs of reducing losses. Advertising market recovery driving revenue growth."""
    },
    "AMZN": {
        "company": "Amazon",
        "thread_title": "AMZN - Amazon Trading Forum",
        "initial_post": """Amazon's AWS continues to dominate cloud infrastructure market with 
        strong AI service adoption. E-commerce profitability improved through operational efficiency. 
        Advertising business growing faster than expected. International expansion shows promising 
        returns."""
    },
    "NFLX": {
        "company": "Netflix",
        "thread_title": "NFLX - Netflix Inc. Journey",
        "initial_post": """Netflix adds millions of subscribers with crackdown on password sharing. 
        Ad-tier adoption exceeds internal projections, creating new revenue stream. Content spending 
        more efficient with hit rate improving. Earnings calls reflect strong confidence."""
    },
}

# Comments for interactions (realistic stock market discussion)
BULLISH_COMMENTS = [
    "Looking strong! The fundamentals are excellent. Long-term hold for me.",
    "Great earnings report. This is just the beginning of the bull run.",
    "Technical support holding well. Expecting breakout soon.",
    "Institutional buying is accelerating. This is a great setup.",
    "The company's guidance is impressive. Earnings beat and raised targets!",
    "Market cap growth potential is significant. Bullish on this one.",
    "Been holding for 3 years, definitely not selling. Too much upside.",
    "Strong quarterly results. Revenue growing faster than expected.",
    "This will be a 10-bagger in 5 years. Mark my words.",
    "Insider buying increases recently. Management believes in the company.",
]

BEARISH_COMMENTS = [
    "Valuation seems stretched at these levels. Waiting for pullback.",
    "The market is pricing in too much growth. Be careful here.",
    "Sector rotation happening. Moving to safer picks.",
    "Technical weakness showing. Support might break next.",
    "Guidance disappointed investors. Expect more selling.",
    "Competition is intensifying. Market share could be at risk.",
    "I'm taking profits here. Locked in 45% gains.",
    "Regulatory risks ahead. Better find an alternative.",
    "This was a good trade but I'm out. Cashing in.",
    "Momentum is fading. Volume decreasing on bounces.",
]

NEUTRAL_COMMENTS = [
    "Solid company but fair value. Not a strong buy or sell.",
    "Mixed signals here. Waiting for clearer direction.",
    "Consolidation pattern forming. Breakout could go either way.",
    "Earnings were okay but not spectacular. Holding for now.",
    "Keep it on your watch list. Good entry at support.",
    "Market sentiment is uncertain. I'm waiting on sidelines.",
    "Company fundamentals are solid but macro headwinds exist.",
    "This is a mature stock. Expect steady growth, not explosions.",
    "Good dividend yield. Income investor friendly.",
    "Worth researching more. Not enough data for position yet.",
]

def print_status(message):
    """Print status message with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")

def register_user(user):
    """Register a virtual user account"""
    try:
        response = requests.post(
            f"{AUTH_BASE_URL}/auth/register",
            json={
                "username": user["username"],
                "email": user["email"],
                "password": user["password"]
            },
            timeout=5
        )
        if response.status_code in [200, 201]:
            print_status(f"✓ Created user: {user['username']}")
            return True
        else:
            print_status(f"✗ Failed to create user {user['username']}: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print_status(f"✗ Error creating user {user['username']}: {str(e)}")
        return False

def login_user(username, password):
    """Login user and get auth tokens"""
    try:
        response = requests.post(
            f"{AUTH_BASE_URL}/auth/login",
            json={
                "username": username,
                "password": password
            },
            timeout=5
        )
        if response.status_code == 200:
            tokens = response.json()
            return tokens.get("accessToken")
        else:
            print_status(f"✗ Failed to login {username}: {response.text}")
            return None
    except Exception as e:
        print_status(f"✗ Error logging in {username}: {str(e)}")
        return None

def get_or_create_category():
    """Get stock category or create if it doesn't exist"""
    try:
        # Try to get existing categories
        response = requests.get(f"{FORUM_BASE_URL}/api/categories", timeout=5)
        if response.status_code == 200:
            categories = response.json()
            for cat in categories:
                if "stock" in cat.get("name", "").lower() or "ticker" in cat.get("name", "").lower():
                    print_status(f"✓ Using existing category: {cat['name']} (ID: {cat['id']})")
                    return cat["id"]
        
        # Create new category if not found
        category_data = {
            "name": "Stock Tickers",
            "description": "Discussion for stock tickers and market analysis"
        }
        response = requests.post(
            f"{FORUM_BASE_URL}/api/categories",
            json=category_data,
            headers={"X-Forum-User": "admin"},
            timeout=5
        )
        if response.status_code in [200, 201]:
            cat_id = response.json().get("id")
            print_status(f"✓ Created new category: Stock Tickers (ID: {cat_id})")
            return cat_id
        else:
            print_status(f"✗ Failed to create category: {response.text}")
            return None
    except Exception as e:
        print_status(f"✗ Error getting/creating category: {str(e)}")
        return None

def create_thread(category_id, username, title, content):
    """Create a thread for a stock ticker"""
    try:
        thread_data = {
            "title": title,
            "userName": username
        }
        response = requests.post(
            f"{FORUM_BASE_URL}/api/categories/{category_id}/threads",
            json=thread_data,
            timeout=5
        )
        if response.status_code in [200, 201]:
            thread = response.json()
            thread_id = thread.get("id")
            
            # Add initial post content
            time.sleep(0.2)
            post_data = {
                "content": content,
                "userName": username
            }
            post_response = requests.post(
                f"{FORUM_BASE_URL}/api/threads/{thread_id}/posts",
                json=post_data,
                timeout=5
            )
            
            if post_response.status_code in [200, 201]:
                print_status(f"✓ Created thread: {title} (ID: {thread_id})")
                return thread_id
            else:
                print_status(f"✗ Failed to create initial post for {title}")
                return thread_id  # Still return thread ID, posts can be added later
        else:
            print_status(f"✗ Failed to create thread {title}: {response.text}")
            return None
    except Exception as e:
        print_status(f"✗ Error creating thread {title}: {str(e)}")
        return None

def create_post(thread_id, username, content):
    """Create a comment/post on a thread"""
    try:
        post_data = {
            "content": content,
            "userName": username
        }
        response = requests.post(
            f"{FORUM_BASE_URL}/api/threads/{thread_id}/posts",
            json=post_data,
            timeout=5
        )
        if response.status_code in [200, 201]:
            print_status(f"✓ Posted comment from {username}")
            return True
        else:
            print_status(f"✗ Failed to create post: {response.text}")
            return False
    except Exception as e:
        print_status(f"✗ Error creating post: {str(e)}")
        return False

def main():
    print("\n" + "="*60)
    print("STOCK FORUM DATA GENERATOR")
    print("="*60 + "\n")
    
    # Step 1: Create user accounts
    print("STEP 1: Creating virtual user accounts...")
    print("-" * 40)
    created_users = []
    for user in VIRTUAL_USERS:
        if register_user(user):
            created_users.append(user["username"])
        time.sleep(0.1)
    
    if not created_users:
        print_status("✗ No users created. Exiting.")
        return
    
    print(f"\n✓ Created {len(created_users)} users\n")
    
    # Step 2: Get or create category
    print("STEP 2: Getting/Creating stock category...")
    print("-" * 40)
    category_id = get_or_create_category()
    if not category_id:
        print_status("✗ Failed to get/create category. Exiting.")
        return
    print()
    
    # Step 3: Create threads for each stock ticker
    print("STEP 3: Creating stock ticker threads...")
    print("-" * 40)
    threads = {}
    creators = created_users[:len(STOCK_TICKERS)]  # Different user creates each thread
    
    for idx, (ticker, ticker_info) in enumerate(STOCK_TICKERS.items()):
        creator = creators[idx % len(creators)]
        thread_id = create_thread(
            category_id,
            creator,
            ticker_info["thread_title"],
            ticker_info["initial_post"]
        )
        if thread_id:
            threads[ticker] = thread_id
        time.sleep(0.2)
    
    print(f"\n✓ Created {len(threads)} stock threads\n")
    
    # Step 4: Add comments and interactions
    print("STEP 4: Adding comments and interactions...")
    print("-" * 40)
    total_posts = 0
    
    for ticker, thread_id in threads.items():
        # Add 5-12 comments per thread
        num_comments = random.randint(5, 12)
        comment_pool = random.sample(created_users, min(6, len(created_users)))
        
        print_status(f"Adding {num_comments} comments to {ticker} thread...")
        
        for i in range(num_comments):
            # Random selection of comment type and user
            comment_type = random.choices(
                ["bullish", "bearish", "neutral"],
                weights=[40, 30, 30]
            )[0]
            
            if comment_type == "bullish":
                comment = random.choice(BULLISH_COMMENTS)
            elif comment_type == "bearish":
                comment = random.choice(BEARISH_COMMENTS)
            else:
                comment = random.choice(NEUTRAL_COMMENTS)
            
            commenter = random.choice(comment_pool)
            
            if create_post(thread_id, commenter, comment):
                total_posts += 1
            
            # Small delay between posts
            time.sleep(0.15)
        
        time.sleep(0.3)
    
    print(f"\n✓ Created {total_posts} comments\n")
    
    # Final summary
    print("="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Users created: {len(created_users)}")
    print(f"Stock threads created: {len(threads)}")
    print(f"Total comments created: {total_posts}")
    print("\nVirtual users:")
    for user in created_users:
        print(f"  - {user}")
    print("\nStock tickers:")
    for ticker in threads.keys():
        print(f"  - {ticker}")
    print("\n✓ Forum data generation completed successfully!\n")

if __name__ == "__main__":
    main()
