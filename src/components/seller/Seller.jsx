import React, { useState, useEffect } from "react";
import './Seller.css';
import { useUser } from "../../contexts/UserContext";

function Seller() {
    const {user} = useUser();
    const [productName, setProductName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [images, setImages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!user || !user.token) {
            console.error("User is not logged in or token is missing.");
            return;
        }

        const fetchCategories = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/categories", {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch categories");
                }

                const data = await response.json();
                setCategories(data);
                console.log("Categories fetched:", data);

                if (data.length > 0 && !selectedCategory) {
                    setSelectedCategory(data[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };

        fetchCategories();
    }, [user, selectedCategory]);

    const handleImageChange = (e) => {
        setImages([...e.target.files]); // Accept multiple files
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        if (!user || !user.token) {
            setMessage("User is not logged in.");
            return;
        }

        let photoObjects = [];

        try {
            for (const file of images) {
                const photoForm = new FormData();
                photoForm.append("photo", file);

                const photoRes = await fetch("http://localhost:8080/api/photo/listing", {
                    method: "POST",
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                    body: photoForm,
                });

                if (!photoRes.ok) throw new Error("Failed to upload a photo.");

                const photoData = await photoRes.json();
                photoObjects.push({ id: photoData, data: "", uploader: "test" });
            }

            const listingBody = {
                title: productName,
                price: parseFloat(price),
                status: "ACTIVE",
                category: { id: parseInt(selectedCategory), name: "placeholder" },
                description: description,
                photos: photoObjects,
                sellerUsername: user.username, // Użyj nazwy użytkownika z kontekstu
            };

            const listingRes = await fetch("http://localhost:8080/api/listings", {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(listingBody),
            });

            if (listingRes.ok) {
                setMessage("Listing created successfully!");
                setProductName("");
                setDescription("");
                setPrice("");
                setImages([]);
            } else {
                const err = await listingRes.json();
                setMessage(`Error creating listing: ${err.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error(error);
            setMessage("An error occurred while creating the listing.");
        }
    };

    return (
        <div>
            <h1>Seller Dashboard</h1>
            <h3>Put new listings on sale</h3>
            <div className="Seller">
                <div className="Seller-columns">
                    <div className="Seller-left">
                        <h2>Add a New Listing</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-element">
                                <label htmlFor="productName">Product Name:</label>
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
                                <label htmlFor="category">Category:</label>
                                <select
                                    id="category"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    required
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-element">
                                <label htmlFor="images">Product Images:</label>
                                <input
                                    id="images"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                />
                            </div>
                            <button type="submit">Create Listing</button>
                        </form>
                        {message && <p className="message">{message}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Seller;
