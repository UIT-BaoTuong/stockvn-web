#!/usr/bin/env python3
"""
Create threads in different categories using Vietnamese user accounts.
"""

import requests
import time
import random
from datetime import datetime

# Configuration
FORUM_BASE_URL = "http://localhost:8081"

# Vietnamese users created in previous step
VIETNAMESE_USERS = [
    "nguyenhunga",
    "trannam2020", 
    "phamtuan_dev",
    "hoanglinh88",
    "vuhung_trader",
    "dangtuanabc",
    "buidung_bull",
    "duonghai_tech",
    "lybinhdev",
    "kieuulinh_fin",
]

# General discussion thread topics
GENERAL_THREADS = [
    {
        "title": "Tới năm 2026, các bạn có kế hoạch gì cho portfolio của mình?",
        "content": "Mình đang suy nghĩ về việc tăng tỷ trọng vào các cổ phiếu công nghệ. Các bạn có ý kiến gì không? Chiến lược của bạn là gì?"
    },
    {
        "title": "Kinh nghiệm trading của các bạn sau 5 năm tham gia thị trường",
        "content": "Mình vừa hoàn thành 5 năm trong thị trường chứng khoán. Đã học được rất nhiều từ những lần lãi và lỗ. Chia sẻ kinh nghiệm của các bạn với mình nhé!"
    },
    {
        "title": "Có nên đầu tư vào các quỹ chỉ số hay cổ phiếu riêng lẻ?",
        "content": "Đây là một câu hỏi khó nhưng tôi muốn nghe ý kiến từ cộng đồng. Các ưu nhược điểm của cách tiếp cận nào?"
    },
    {
        "title": "Phân tích kỹ thuật vs Phân tích cơ bản - Cái nào quan trọng hơn?",
        "content": "Một cuộc tranh luận lâu đời trong thế giới trading. Những gì các bạn sử dụng? Kết hợp cả hai hay tập trung vào một?"
    },
]

# Technology discussion threads
TECH_THREADS = [
    {
        "title": "AI sẽ thay đổi thế giới công nghệ thế nào?",
        "content": "ChatGPT, Gemini, và các mô hình AI khác đang phát triển rất nhanh. Tác động lên thị trường chứng khoán sẽ ra sao?"
    },
    {
        "title": "Cryptocurrency và blockchain có tương lai không?",
        "content": "Sau những khủng hoảng gần đây, liệu crypto có còn giá trị đầu tư dài hạn?"
    },
    {
        "title": "Các startup nào đáng theo dõi hiện nay?",
        "content": "Tìm kiếm các startup tiềm năng. Ai có thông tin về những công ty khởi động mới có khả năng phát triển?"
    },
]

# Investment tips threads  
TIPS_THREADS = [
    {
        "title": "Quản lý rủi ro - Cách bảo vệ vốn của bạn",
        "content": "Làm thế nào để giảm thiểu tổn thất khi thị trường sụt giảm? Các chiến lược risk management hiệu quả."
    },
    {
        "title": "Cách xây dựng danh mục đầu tư chủ động",
        "content": "Những nguyên tắc cơ bản để tạo một danh mục cân bằng và có tiềm năng tăng trưởng."
    },
    {
        "title": "Sai lầm phổ biến của trader mới",
        "content": "Những lỗi thường gặp khi bắt đầu. Để tránh theo cùng con đường của người khác!"
    },
]

# Market analysis threads
MARKET_THREADS = [
    {
        "title": "Xu hướng thị trường quý 1/2026",
        "content": "Phân tích thị trường toàn cầu. Các xu hướng chính mà ta cần lưu ý."
    },
    {
        "title": "Tác động của lãi suất lên thị trường chứng khoán",
        "content": "Các ngân hàng trung ương đang thay đổi chính sách. Điều này có ý nghĩa gì?"
    },
]

# Comments for interactions
DISCUSSION_COMMENTS = [
    "Tôi hoàn toàn đồng ý với ý kiến này!",
    "Điều này là rất hữu ích, cảm ơn bạn đã chia sẻ.",
    "Lâu lắm rồi không thấy bài viết nào hay như vậy.",
    "Bạn có thể giải thích chi tiết hơn một chút không?",
    "Kinh nghiệm quý báu, mình sẽ áp dụng ngay.",
    "Tôi có ý kiến khác, có thể xem xét góc độ này...",
    "Bài viết rất hay, +1 cho ý tưởng này.",
    "Mình cũng trải qua tình huống tương tự.",
    "Cảm ơn bạn, đây chính xác là điều tôi cần.",
    "Bạn biết tài liệu nào ngoài cái này không?",
]

def print_status(message):
    """Print status message with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")

def get_all_categories():
    """Get all existing categories"""
    try:
        response = requests.get(f"{FORUM_BASE_URL}/api/categories", timeout=5)
        if response.status_code == 200:
            categories = response.json()
            if isinstance(categories, dict):
                categories = [categories]
            return categories
        else:
            print_status(f"✗ Failed to get categories: {response.status_code}")
            return []
    except Exception as e:
        print_status(f"✗ Error getting categories: {str(e)}")
        return []

def create_category(name, description):
    """Create a new category"""
    try:
        category_data = {
            "name": name,
            "description": description
        }
        response = requests.post(
            f"{FORUM_BASE_URL}/api/categories",
            json=category_data,
            headers={"X-Forum-User": "admin"},
            timeout=5
        )
        if response.status_code in [200, 201]:
            cat = response.json()
            print_status(f"✓ Created category: {name} (ID: {cat.get('id')})")
            return cat.get("id")
        else:
            print_status(f"✗ Failed to create category {name}: {response.text}")
            return None
    except Exception as e:
        print_status(f"✗ Error creating category {name}: {str(e)}")
        return None

def get_or_create_category(name, description):
    """Get category or create if not exists"""
    categories = get_all_categories()
    for cat in categories:
        if cat.get("name", "").lower() == name.lower():
            return cat.get("id")
    return create_category(name, description)

def create_thread(category_id, username, title, content):
    """Create a thread in a category"""
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
            
            # Add initial post
            time.sleep(0.1)
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
                print_status(f"✓ Created thread: {title} by {username} (ID: {thread_id})")
                return thread_id
            else:
                print_status(f"✗ Failed to create initial post for {title}")
                return thread_id
        else:
            print_status(f"✗ Failed to create thread {title}: {response.text}")
            return None
    except Exception as e:
        print_status(f"✗ Error creating thread {title}: {str(e)}")
        return None

def create_post(thread_id, username, content):
    """Create a comment on a thread"""
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
            return True
        else:
            return False
    except Exception as e:
        return False

def main():
    print("\n" + "="*70)
    print("CREATING THREADS IN MULTIPLE CATEGORIES")
    print("="*70 + "\n")
    
    # Step 1: Create/get categories
    print("STEP 1: Setting up categories...")
    print("-" * 40)
    
    categories = {
        "general": get_or_create_category("Thảo luận chung", "Thảo luận chung về đầu tư"),
        "technology": get_or_create_category("Công nghệ", "Chứng khoán công nghệ và xu hướng"),
        "tips": get_or_create_category("Mẹo & Kỹ thuật", "Các mẹo đầu tư và kỹ thuật trading"),
        "market": get_or_create_category("Phân tích thị trường", "Phân tích và tin tức thị trường"),
    }
    
    print(f"\n✓ {len([c for c in categories.values() if c])} categories ready\n")
    
    # Step 2: Create general discussion threads
    if categories["general"]:
        print("STEP 2: Creating general discussion threads...")
        print("-" * 40)
        threads_general = []
        for thread_info in GENERAL_THREADS:
            creator = random.choice(VIETNAMESE_USERS)
            thread_id = create_thread(
                categories["general"],
                creator,
                thread_info["title"],
                thread_info["content"]
            )
            if thread_id:
                threads_general.append(thread_id)
            time.sleep(0.2)
        print()
    
    # Step 3: Create technology threads
    if categories["technology"]:
        print("STEP 3: Creating technology discussion threads...")
        print("-" * 40)
        threads_tech = []
        for thread_info in TECH_THREADS:
            creator = random.choice(VIETNAMESE_USERS)
            thread_id = create_thread(
                categories["technology"],
                creator,
                thread_info["title"],
                thread_info["content"]
            )
            if thread_id:
                threads_tech.append(thread_id)
            time.sleep(0.2)
        print()
    
    # Step 4: Create tips threads
    if categories["tips"]:
        print("STEP 4: Creating trading tips threads...")
        print("-" * 40)
        threads_tips = []
        for thread_info in TIPS_THREADS:
            creator = random.choice(VIETNAMESE_USERS)
            thread_id = create_thread(
                categories["tips"],
                creator,
                thread_info["title"],
                thread_info["content"]
            )
            if thread_id:
                threads_tips.append(thread_id)
            time.sleep(0.2)
        print()
    
    # Step 5: Create market analysis threads
    if categories["market"]:
        print("STEP 5: Creating market analysis threads...")
        print("-" * 40)
        threads_market = []
        for thread_info in MARKET_THREADS:
            creator = random.choice(VIETNAMESE_USERS)
            thread_id = create_thread(
                categories["market"],
                creator,
                thread_info["title"],
                thread_info["content"]
            )
            if thread_id:
                threads_market.append(thread_id)
            time.sleep(0.2)
        print()
    
    # Step 6: Add comments to all threads
    print("STEP 6: Adding interactions to threads...")
    print("-" * 40)
    all_threads = []
    for cat_threads in [threads_general if categories["general"] else [],
                        threads_tech if categories["technology"] else [],
                        threads_tips if categories["tips"] else [],
                        threads_market if categories["market"] else []]:
        all_threads.extend(cat_threads)
    
    total_comments = 0
    for thread_id in all_threads:
        num_comments = random.randint(3, 7)
        for _ in range(num_comments):
            commenter = random.choice(VIETNAMESE_USERS)
            comment = random.choice(DISCUSSION_COMMENTS)
            if create_post(thread_id, commenter, comment):
                total_comments += 1
            time.sleep(0.1)
    
    print_status(f"✓ Added {total_comments} comments")
    print()
    
    # Summary
    print("="*70)
    print("SUMMARY")
    print("="*70)
    print(f"Categories created/found: {len([c for c in categories.values() if c])}")
    print(f"Threads created: {len(all_threads)}")
    print(f"Total comments: {total_comments}")
    print("\nCategories:")
    for cat_name, cat_id in categories.items():
        if cat_id:
            print(f"  - {cat_name}: ID {cat_id}")
    print("\n✓ Thread creation completed successfully!\n")

if __name__ == "__main__":
    main()
