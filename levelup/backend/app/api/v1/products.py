from flask import jsonify, request
from . import v1_bp
from ...models import Product, Genre, ProductImage
from app import db


# Retrieve all active products with optional filters by genre and type
@v1_bp.route("/products", methods=["GET"])
def get_products():
    genre_filter = request.args.get("genre")
    type_filter = request.args.get("type")

    query = Product.query.filter(Product.is_active.is_(True))

    if genre_filter:
        query = query.filter(Product.genres.any(Genre.name == genre_filter))
    if type_filter:
        query = query.filter(Product.type == type_filter)

    products = query.all()
    return jsonify({"products": [product.to_dict() for product in products]})


# Retrieve a single product by its ID
@v1_bp.route("/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify({"product": product.to_dict()})


# Retrieve all available genres
@v1_bp.route("/genres", methods=["GET"])
def get_genres():
    genres = Genre.query.all()
    return jsonify({"genres": [genre.to_dict() for genre in genres]})


# Retrieve all reviews for a specific product
@v1_bp.route("/products/<int:product_id>/reviews", methods=["GET"])
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
        name=data.get("name"),
        description=data.get("description"),
        genres=Genre.query.filter(
            Genre.name.in_(data.get("genres", []))).all(),
        price=data.get("price"),
        type=data.get("type"),
        is_active=data.get("is_active", True),
    )
    db.session.add(product)
    db.session.commit()
    return jsonify({"product": product.to_dict()}), 201


# Update an existing product with new details
@v1_bp.route("/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    data = request.get_json()
    product.name = data.get("name", product.name)
    product.description = data.get("description", product.description)
    if "genres" in data:
        product.genres = Genre.query.filter(
            Genre.name.in_(data["genres"])).all()
    product.price = data.get("price", product.price)
    product.type = data.get("type", product.type)
    product.is_active = data.get("is_active", product.is_active)
    db.session.commit()
    return jsonify(product.to_dict())


# Soft delete a product by marking it as inactive
@v1_bp.route("/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    product.is_active = False
    db.session.commit()
    return jsonify({"message": "Product deleted"})


# Add a new image to a product
@v1_bp.route("/products/<int:product_id>/images", methods=["POST"])
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


# Delete a specific image from a product
@v1_bp.route("/products/<int:product_id>/images/<int:image_id>",
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
