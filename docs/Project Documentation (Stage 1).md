# 🎲 Level UP – Project Documentation

## 0. Team Formation and Role Definition
- **Initial Meeting**: (Ylan, Théo, Alexandre) We discussed the project and shared our ideas as well as our expectations.
- **Roles Assigned**: We appointed a temporary Project Manager, which will be Alexandre for the initial phase.
- **Team Norms**:
  - Communication via **Discord**.
  - Task management with **GitHub Projects**.
  - Weekly sync meeting every Tuesday.

- **Individual Research**: Each team member independently researched and analyzed similar applications and websites to identify their strengths and weaknesses.

- **Technical Distribution**:
	- Théo: UI/UX Designer / Frontend Developer
	- Ylan: Backend Leader
	- Alexandre: Data + Fullstack Helper
---
## 1. Research and Brainstorming
- **Group Brainstorming**:
  - **Mind Mapping**: Explored ideas around game resell, price, update, reservation.
  - **SCAMPER Framework**: Gambling system with chests that provide more valuable games or less buyable with money or unwanted keys.
  - **“How Might We”** Questions:
    - How might we make the website more attractive?
    - How might we integrate multiple payment options seamlessly?
    - How might we make the site fresh, modern, and mobile-friendly?

---

## 2. Idea Evaluation 
- **Criteria Defined**:
  - Feasibility for a beginner developer.
  - Potential impact for customers (ease of use, accessibility).
  - Technical alignment with modern frameworks (React, Tailwind, Stripe).

### Priorities
- **MVP 🔴** → Mandatory task to make the site functional.  
- **Important  🟡** → To provide a better experience for the client.  
- **Optional 🟣** → Add-ons and extra features.  
- **Future  🔵** → Improve the future roadmap and scale the site.  

| **Feature** | **Notes** | **Feasibility** | **Risks** | **Priority** |
|:---:|:---:|:---:|:---:|:---:|
| Home + Menu + Game Details | Modern homepage, category navigation, and detailed product page (price, platform, description). | 5/5 | None | 🔴 |
| Cart + Key Management | System to add to cart and preparation for virtual key delivery after purchase. | 5/5 | Key validity management. | 🔴 |
| Payment (Stripe / Apple & Google Pay) | Secure integration for card transactions and digital wallets. | 3/5 | Payment API complexity, requires documentation. | 🔴 |
| Order Database | Sales history, customer transactions, and key status (sold/available) with timestamps. | 4/5 | Transactional data security. | 🔴 |
| Confirmation Page (Success) | Purchase confirmation with order summary and key display/email delivery. | 4/5 | None | 🔴 |
| Mobile Version (Responsive) | Interface adapted to allow game purchases anywhere, anytime. | 5/5 | Essential for the mobile target audience. | 🔴 |
| Basic Admin Panel | Interface to add new games, modify prices, and track key stocks. | 3/5 | None | 🟣 |
| Reviews and Rating Zone | Allow players to rate games and leave comments on the site. | 3/5 | Management of inappropriate reviews. | 🟣 |
| Newsletter | Alerts for promotions, new game arrivals, and gaming news. | 3/5 | Risk of being marked as Spam. | 🟣 |
| Lootbox System (Gambling) | Chest system allowing users to obtain random games of varying rarity. | 2/5 | Algorithm complexity for probabilities and virtual currency. | 🔵 |
| Trend Geolocation | Interactive map showing the most popular games by region or country. | 1/5 | Complex learning curve for mapping APIs. | 🔵 |
| Social Media Feed | Dynamic display of community posts and Twitch/Twitter news directly on the site. | 1/5 | None | 🔵 |

- **Risks Identified**:
  - Payment integration complexity (Stripe, PayPal).
  - Key management.
  - Virtual currency management.
  - Gambling system management.

---

## 3. Decision and Refinement
- **Final MVP Selected**: Modern responsive game selling website (**Level Up**).
- **Problem Solved**: Buy games anywhere, anytime at a lower price.
- **Target Audience**: All gamers as well as affiliated communities.
- **Application Type**: Webapp
- **Key Features**:
  - Menu browsing by categories.
  - Add new games.
  - Checkout with **Stripe (Card, Apple Pay, Google Pay)**.
  - Sales and transaction history in the database.
  - Basic admin panel.
- **Why this app?**: It's a growing market with increasing demand, and the team is familiar with this field.
- **Expected Outcome**:
	- **In Scope**: A functional MVP demonstrating complete game selling from homepage to payment confirmation.
	- **Out of Scope**: A complete gambling solution with multiple ways to trade games.
