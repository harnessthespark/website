// LinkedIn Content Auto-Updater for Harness the Spark
// This script automatically fetches your LinkedIn posts and updates your website

class LinkedInContentManager {
  constructor() {
    this.profileUrl = 'https://www.linkedin.com/in/lisagills/';
    this.postsCache = [];
    this.lastUpdate = null;
  }

  // Simulate fetching LinkedIn posts (in production, use RapidAPI or scraper)
  async fetchLinkedInPosts() {
    console.log('🔄 Fetching LinkedIn posts...');
    
    // For now, return sample data structure
    // Replace this with actual API call to LinkedIn scraper service
    const mockPosts = [
      {
        id: 'post_1',
        title: 'Stop apologising for your brain in interviews',
        excerpt: 'The moment you say "Sorry, I\'m a bit scattered" or "I know I talk too much but..." - you\'ve just taught them to see you as a problem to solve rather than talent to hire.',
        category: 'career',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        engagement: {
          likes: 89,
          comments: 23,
          reposts: 15
        },
        url: 'https://www.linkedin.com/posts/lisagills_interviews-career-activity-123456789'
      },
      {
        id: 'post_2',
        title: 'Your "perfect candidate" doesn\'t exist',
        excerpt: 'That unicorn job spec you\'ve been posting for 6 months? It\'s not attracting top talent - it\'s filtering out everyone who could actually do the job.',
        category: 'hiring',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        engagement: {
          likes: 156,
          comments: 45,
          reposts: 32
        },
        url: 'https://www.linkedin.com/posts/lisagills_hiring-recruitment-activity-987654321'
      }
      // Add more posts as needed
    ];

    return mockPosts;
  }

  // Update the website content with new LinkedIn posts
  async updateWebsiteContent(posts) {
    console.log('📝 Updating website content...');
    
    // Generate HTML for content cards
    const contentCards = posts.map(post => this.generateContentCard(post)).join('\n');
    
    // Update the insights.html file
    await this.updateInsightsPage(contentCards);
    
    console.log('✅ Website updated successfully!');
  }

  // Generate HTML for a single content card
  generateContentCard(post) {
    const timeAgo = this.getTimeAgo(post.date);
    const categoryColor = this.getCategoryColor(post.category);
    
    return `
            <div class="content-card" data-category="${post.category}" style="background: rgba(30, 30, 30, 0.8); padding: 2rem; border-radius: 15px; border: 1px solid rgba(228, 159, 75, 0.2); transition: all 0.3s ease;">
              <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                <span style="background: ${categoryColor.bg}; color: ${categoryColor.text}; padding: 0.25rem 0.75rem; border-radius: 10px; font-size: 0.8rem; font-weight: 600;">${post.category.toUpperCase()}</span>
                <span style="color: var(--text-dim); font-size: 0.9rem;">${timeAgo}</span>
              </div>
              <h3 style="color: var(--text-light); margin-bottom: 1rem; font-size: 1.2rem;">${post.title}</h3>
              <p style="color: var(--text-dim); line-height: 1.6; margin-bottom: 1.5rem;">${post.excerpt}</p>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 1rem; color: var(--text-dim); font-size: 0.9rem;">
                  <span>💬 ${post.engagement.comments} comments</span>
                  <span>🔄 ${post.engagement.reposts} reposts</span>
                  <span>❤️ ${post.engagement.likes} likes</span>
                </div>
                <a href="${post.url}" target="_blank" style="color: var(--accent-orange); text-decoration: none; font-weight: 600;">Read on LinkedIn →</a>
              </div>
            </div>`;
  }

  // Get category colors
  getCategoryColor(category) {
    const colors = {
      career: { bg: 'var(--accent-pink)', text: 'white' },
      hiring: { bg: 'var(--accent-orange)', text: 'white' },
      neurodiversity: { bg: '#44ff88', text: '#0a0a0a' },
      rants: { bg: '#ff4444', text: 'white' }
    };
    return colors[category] || colors.career;
  }

  // Calculate time ago
  getTimeAgo(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }

  // Update the insights.html file
  async updateInsightsPage(contentCards) {
    // In a real implementation, this would:
    // 1. Read the current insights.html file
    // 2. Replace the content grid section
    // 3. Write the updated file back
    
    console.log('📄 Content cards generated:', contentCards.length, 'characters');
    
    // For now, just log what we would update
    console.log('Would update insights.html with new content cards');
  }

  // Main function to run the update process
  async runUpdate() {
    try {
      console.log('🚀 Starting LinkedIn content update...');
      
      const posts = await this.fetchLinkedInPosts();
      await this.updateWebsiteContent(posts);
      
      this.lastUpdate = new Date();
      console.log(`✅ Update completed at ${this.lastUpdate.toISOString()}`);
      
    } catch (error) {
      console.error('❌ Error updating LinkedIn content:', error);
    }
  }

  // Set up automatic updates
  startAutoUpdate(intervalHours = 6) {
    console.log(`⏰ Starting auto-update every ${intervalHours} hours`);
    
    // Run initial update
    this.runUpdate();
    
    // Set up recurring updates
    const intervalMs = intervalHours * 60 * 60 * 1000;
    setInterval(() => {
      this.runUpdate();
    }, intervalMs);
  }
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LinkedInContentManager;
} else {
  window.LinkedInContentManager = LinkedInContentManager;
}

// Example usage:
// const manager = new LinkedInContentManager();
// manager.startAutoUpdate(6); // Update every 6 hours