# LEVELUP - Technical Documentation

This documentation aims to provide a clear and structured vision for the MVP development process. It helps anticipate technical requirements, organize source control and quality assurance practices, reduce risks, improve collaboration, and align all stakeholders on the project’s technical direction.



## 1 User Stories and mockups

### Must Have

- As a normal user, I want to create an account, so that allow me to register.
- As a normal user, I want to delete an account, so that allow me to remove my personal information.
- As a normal user, I want to reset my password, so that allow me recover my account.
- As a normal user, I want see all the buyable product, so that allow me to discover them.
- As a normal user, I want buy my product on a website, so that save me from having to travel.
- As a normal user, I want to get a buying summary, so that allow me get all needed information like commande id and key.
- As a normal user, I want a responsive website, so that allow me to use it from different device.
- As an admin user, I want to check key status, so that allow to keep an eye on storage.
- As an admin user, I want to add/delete/update product card, so that allow me to perform CRUD operation.

### Should Have

- As a normal user, I want a user page so that allow me to see my favorite and buying historic once connected.
- As a normal user, I want a filter so that allow me to get faster the kind of thing i'm looking for.
- As a normal user, I want a good UI so that allow me to navigate faster and easier.
- As a normal user, I want a dark mode so that allow me a better accessibility.
- As a normal user, I want to note and add a comment if wanted so that allow me to share my experience.
- As an admin user, I want to check buying historic overall and by id, so that allow me to help a customer if needed.

### Could Have

- As a normal user, I want to update my profil information so that allow me to update username, profilpicture, user description. 
- As a normal user, I want to add friend so that allow me to see their own favorite.
- As a normal user, I want to gamble so that give me a chance to get a better key.
### Won't Have

- no promotion code
- multi language
- no loyalty points

## Mockups

<table>
  <tr>
    <td><img src="./template/auth_mockup.png" alt="Logo 1" width="400"/></td>
    <td><img src="./template/card_mockup.png" alt="Logo 2" width="400"/></td>
  </tr>
</table>

## Design System Architecture

```mermaid
flowchart LR
 subgraph frontend["Frontend"]
        webapp["React WebApp"]
  end
 subgraph backend["Backend Python flask"]
        api["API"]
        facade["Facade"]
        Models["Business Models"]
  end
 subgraph database["Database"]
        sqlite[("SQLite database")]
  end
 subgraph external["External Services"]
        stripe["Stripe"]
  end
    webapp -- https --> api
    api --> facade
    api -- https --> stripe
    facade --> Models
    facade -- SQLAlchemy --> sqlite
```

## 2 Components, Classes and Database design

### 2.1 Front-end components

This table summarizes the pages and components to define the UI scope and clarify major interactions.

| Component / Page   | Type        | Purpose                                                                 |
|--------------------|-------------|-------------------------------------------------------------------------|
| `HomePage`         | Page        | Main page with popular game                                            |
| `Card`             | Page        | Displays card with optional filter                                     |
| `LoginPage`        | Page        | User login with email and password                                     |
| `RegisterPage`     | Page        | User can create an account                                             |
| `AdminDashboard`   | Page        | Panel to manage website                                                |
| `Cart`             | Page        | Check added game and purchase                                          |
| `Filter`           | UI Component| Filter game                                                            |
| `Card`             | UI Component| Game picture with price                                                |
| `Cart`             | UI Component| Shopping cart                                                          |
| `AdminPanel`       | UI Component| add/delete/update game card                                            |
| `Header`           | UI Component| Login, navigation links, Logo                                          |

**Interactions :**

- Register/login -> Use /auth route API from backend
- Admin add card -> Call "PUT" method from backend API
- Filter -> Check all item category id and only display the one filter

### 2.2 Database diagram (ER)

This ER diagram helps visualize entities and relationships to validate keys and the data structure.

```mermaid
erDiagram
    direction TB

    USER {
        uuid id PK
        string username
        string profile_picture_url "nullable"
        string email UK
        string password
        boolean is_admin
        timestamp created_at
        timestamp updated_at
    }

    REVIEW {
        uuid id PK
        uuid user_id FK
        uuid product_id FK
        string text "nullable"
        int rating "1-10"
        timestamp created_at
        timestamp updated_at
    }

    TRANSACTION {
        uuid id PK
        uuid user_id FK
        int amount_cents
        string type "deposit|product_buy|crate_open"
        string reference_id "nullable - order_id|crate_id"
        timestamp created_at
    }

    PRODUCT {
        uuid id PK
        string type "key|crate"
        string name
        string description "nullable"
        int price_cents
        jsonb metadata "nullable - steam_appid, cover_url"
    }

    CART {
        uuid id PK
        uuid user_id FK
    }

    CART_ITEM {
        uuid id PK
        uuid cart_id FK
        uuid product_id FK
        int quantity
        timestamp added_at
    }

    ORDER {
        uuid id PK
        uuid user_id FK
        int total_cents
        timestamp created_at
    }

    ORDER_ITEM {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        int quantity
        int price_at_purchase_cents
    }

    USER_INVENTORY {
        uuid id PK
        uuid user_id FK
        uuid product_id FK
        string state "in_inventory|activated|opened"
        timestamp acquired_at
    }

    INVENTORY_ITEM {
        uuid id PK
        uuid product_id FK
        uuid user_inventory_id FK "nullable"
        string activation_code "nullable"
        boolean is_used
        timestamp used_at "nullable"
    }

    USER ||--|| CART : "has"
    USER ||--o{ ORDER : "places"
    USER ||--o{ USER_INVENTORY : "owns"
    USER ||--o{ TRANSACTION : "executes"
    
    CART ||--o{ CART_ITEM : "contains"
    PRODUCT ||--o{ CART_ITEM : "is_in"
    
    ORDER ||--o{ ORDER_ITEM : "contains"
    PRODUCT ||--o{ ORDER_ITEM : "is_in"
    ORDER ||--|| TRANSACTION : "paid_by"
    
    PRODUCT ||--o{ USER_INVENTORY : "referenced_by"
    PRODUCT ||--o{ INVENTORY_ITEM : "contains_stock_of"
    USER_INVENTORY ||--o{ INVENTORY_ITEM : "links_to"
```

### 2.3 Back-end classes

This flowchart shows service separation and dependencies to validate flows and responsibilities.

```mermaid
graph LR
    subgraph API["Backend API"]
        AuthService["Auth Service"]
        MenuService["Menu Service"]
        OrderService["Order Service"]
        PaymentService["Payment Service"]

        OrderService -->|Calls| PaymentService
    end

    AuthService --> UserDB[("Users Table")]
    MenuService --> GamesDB[("Product")]
    OrderService --> OrderDB[("Orders Table")]
    PaymentService --> PaymentDB[("Payments Table")]
```