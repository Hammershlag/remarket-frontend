import React, { useState, useEffect } from "react";
import './Seller.css';
import { useUser } from "../../contexts/UserContext";

function Seller() {
    const {user} = useUser();
    const [productName, setProductName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [images, setImages] = useState([]);
    const [photoObjects, setPhotoObjects] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [message, setMessage] = useState("");
    const [uploadingPhotos, setUploadingPhotos] = useState(false);

    useEffect(() => {
        if (!user || !user.token) {
            console.error("User is not logged in or token is missing.");
            return;
        }

        const fetchCategories = async () => {
            try {
                const response = await fetch(process.env.REACT_APP_BASE_URL + '/api/categories', {
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

    const handleImageChange = async (e) => {
        const files = [...e.target.files];

        if (!user || !user.token) {
            setMessage("User is not logged in.");
            return;
        }

        if (files.length === 0) {
            return;
        }

        setUploadingPhotos(true);
        setMessage("Uploading photos...");

        try {
            const newPhotoObjects = [];

            for (const file of files) {
                const photoForm = new FormData();
                photoForm.append("photo", file);

                const photoRes = await fetch(process.env.REACT_APP_BASE_URL + '/api/photo/listing', {
                    method: "POST",
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                    body: photoForm,
                });

                if (!photoRes.ok) throw new Error("Failed to upload a photo.");

                const photoData = await photoRes.json();
                newPhotoObjects.push({ id: photoData, data: "", uploader: "test" });
            }

            setPhotoObjects(prev => [...prev, ...newPhotoObjects]);
            setImages(prev => [...prev, ...files]);
            setMessage("Photos uploaded successfully!");
        } catch (error) {
            console.error("Photo upload error:", error);
            setMessage("Failed to upload photos. Please try again.");
        } finally {
            setUploadingPhotos(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        if (!user || !user.token) {
            setMessage("User is not logged in.");
            return;
        }

        try {
            const listingBody = {
                title: productName,
                price: parseFloat(price),
                status: "ACTIVE",
                category: { id: parseInt(selectedCategory), name: "placeholder" },
                description: description,
                photos: photoObjects,
                sellerUsername: user.username,
            };

            const listingRes = await fetch(process.env.REACT_APP_BASE_URL + '/api/listings', {
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
                setPhotoObjects([]);
                // Reset file input
                document.getElementById('images').value = '';
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
                                    disabled={uploadingPhotos}
                                />
                                {uploadingPhotos && <p>Uploading photos...</p>}
                                {photoObjects.length > 0 && (
                                    <p>{photoObjects.length} photo(s) uploaded successfully</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="seller-button"
                                disabled={uploadingPhotos}
                            >
                                Create Listing
                            </button>
                        </form>
                        {message && <p className="message">{message}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Seller;