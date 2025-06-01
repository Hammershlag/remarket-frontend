import React, { useState } from "react";
import './Seller.css';


function Seller() {
    const [productName, setProductName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState(null);
    const [message, setMessage] = useState("");
    const [products, setProducts] = useState([
        { id: 1, name: "Sample Product 1", price: 100, description: "Description 1" },
        { id: 2, name: "Sample Product 2", price: 200, description: "Description 2" },
    ]);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", productName);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("image", image);

        try {
            const response = await fetch("http://localhost:5208/api/products", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                setMessage("Product added successfully!");
                setProductName("");
                setDescription("");
                setPrice("");
                setImage(null);
                // Add the new product to the list (mocked for now)
                const newProduct = { id: Date.now(), name: productName, price, description };
                setProducts([...products, newProduct]);
            } else {
                const errorData = await response.json();
                setMessage(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error("Error:", error);
            setMessage("An error occurred while adding the product.");
        }
    };

    const handleViewArchive = () => {
        alert("Redirecting to archive page...");
    };

    return (
        <div>
            <h1>Seller Dashboard</h1>
            <h3>Put new listings on sale and monitor your existing ones</h3>
            <div className="Seller">
                <div className="Seller-columns">
                    <div className="Seller-left">
                        <h2>Add a New Product</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-element">
                                <label htmlFor="productName">Product Name: </label>
                                <input
                                    id="productName"
                                    type="text"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-element">
                                <label htmlFor="description">Description:</label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-element">
                                <label htmlFor="price">Price ($):</label>
                                <input
                                    id="price"
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-element">
                                <label htmlFor="image">Product Image:</label>
                                <input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    required
                                />
                            </div>
                            <button type="submit">Add Product</button>
                        </form>
                        {message && <p className="message">{message}</p>}
                    </div>
    
                    <div className="Seller-right">
                        <h2>Your Current Products</h2>
                        <ul>
                            {products.map((product) => (
                                <li key={product.id} className="product-item">
                                    <img
                                        src={product.image || "placeholder.jpg"}
                                        alt={product.name}
                                        className="product-image"
                                    />
                                    <div className="product-details">
                                        <h3>{product.name}</h3>
                                        <p>
                                            {product.description.length > 50
                                                ? `${product.description.substring(0, 50)}...`
                                                : product.description}
                                        </p>
                                        <p>Price: ${product.price}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button onClick={handleViewArchive}>View Archive</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Seller;