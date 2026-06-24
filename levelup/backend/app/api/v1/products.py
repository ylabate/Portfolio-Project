from flask import jsonify, request
from . import v1_bp
from ...models import Product, Genre, ProductImage
from app import db


# Retrieve all active products with optional filters by genre and type
@v1_bp.route("/products", methods=["GET"])
def get_products():
    genre_filter = request.args.get("genre")
    type_filter = request.args.get("type")
    price_min = request.args.get("price_min", type=float)
    price_max = request.args.get("price_max", type=float)
    search = request.args.get("search")
    sort = request.args.get("sort")
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 20, type=int)
    offset = (page - 1) * limit

    query = Product.query.filter(Product.is_active.is_(True))

    if genre_filter:
        query = query.filter(Product.genres.any(Genre.name == genre_filter))
    if type_filter:
        query = query.filter(Product.type == type_filter)

    if price_min:
        query = query.filter(Product.price_cents >= price_min * 100)
    if price_max:
        query = query.filter(Product.price_cents <= price_max * 100)
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    if sort == "price_asc":
        query = query.order_by(Product.price_cents.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.price_cents.desc())
    elif sort == "name":
        query = query.order_by(Product.name.asc())
    query = query.limit(limit).offset(offset)

    products = query.all()
    return jsonify({"products": [product.to_dict_list() for product in products]})


# Retrieve a single product by its ID
@v1_bp.route("/products/<string:product_id>", methods=["GET"])
def get_product(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify({"product": product.to_dict()})


# Retrieve all available genres
@v1_bp.route("/genres", methods=["GET"])
def get_genres():
    genres = Genre.query.all()
    return jsonify({"genres": [genre.to_dict() for genre in genres]})


# Retrieve all reviews for a specific product
@v1_bp.route("/products/<string:product_id>/reviews", methods=["GET"])
def get_product_reviews(product_id):
    product = Product.query.get_or_404(product_id)
    reviews = product.reviews.all()
    return jsonify({"reviews": [review.to_dict() for review in reviews]})


# Create a new product with provided details and genres
@v1_bp.route("/products", methods=["POST"])
def create_product():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input"}), 400
    product = Product(
        name=data.get("product_name"),
        description=data.get("description"),
        genres=Genre.query.filter(
            Genre.name.in_(data.get("genres", []))).all(),
        price=data.get("price"),
        type=data.get("type"),
        is_active=data.get("is_active", True),
    )
    db.session.add(product)

    thumbnail_link = data.get("product_thumbnail_link")
    if thumbnail_link:
        thumbnail = ProductImage(
            link=thumbnail_link,
            is_thumbnail=True,
            product=product
        )
        db.session.add(thumbnail)

    for image_data in data.get("product_images", []):
        image = ProductImage(
            link=image_data.get("link"),
            alt_text=image_data.get("alt"),
            product=product
        )
        db.session.add(image)
    db.session.commit()
    return jsonify({"product_id": product.id}), 201


# Update an existing product with new details
@v1_bp.route("/products/<string:product_id>", methods=["PATCH"])
def update_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    data = request.get_json()
    product.name = data.get("product_name", product.name)
    product.description = data.get("description", product.description)
    if "genres" in data:
        product.genres = Genre.query.filter(
            Genre.name.in_(data["genres"])).all()
    product.price = data.get("price", product.price)
    product.type = data.get("type", product.type)
    product.is_active = data.get("is_active", product.is_active)

    if "product_thumbnail_link" in data:
        thumbnail = next((image for image in product.images
                          if image.is_thumbnail), None)
        if thumbnail:
            thumbnail.link = data["product_thumbnail_link"]
        else:
            db.session.add(ProductImage(
                link=data["product_thumbnail_link"],
                is_thumbnail=True,
                product=product
            ))
    db.session.commit()
    return jsonify({"message": "Successfully updated"})


# Soft delete a product by marking it as inactive
@v1_bp.route("/products/<string:product_id>", methods=["DELETE"])
def delete_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    product.is_active = False
    db.session.commit()
    return jsonify({"message": "Product deleted"})


# Add a new image to a product
@v1_bp.route("/products/<string:product_id>/images", methods=["POST"])
def add_product_image(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    data = request.get_json()
    link = data.get("link")
    if not link:
        return jsonify({"error": "Image link is required"}), 400
    image = ProductImage(link=link, product=product)
    db.session.add(image)
    db.session.commit()
    return jsonify({"image": image.to_dict()}), 201


# Create a new genre with the provided name
@v1_bp.route("/genres", methods=["POST"])
def create_genre():
    data = request.get_json()
    if not data or "name" not in data:
        return jsonify({"error": "Name is required"}), 400
    genre = Genre(name=data["name"])
    db.session.add(genre)
    db.session.commit()
    return jsonify({"genre": genre.to_dict()}), 201


# Delete a specific image from a product
@v1_bp.route("/products/<string:product_id>/images/<string:image_id>",
             methods=["DELETE"])
def delete_product_image(product_id, image_id):
    image = (
        ProductImage.query
        .filter(ProductImage.id == image_id,
                ProductImage.product_id == product_id)
        .first()
    )
    if not image:
        return jsonify({"error": "Image not found"}), 404
    db.session.delete(image)
    db.session.commit()
    return jsonify({"message": "Image deleted"})
