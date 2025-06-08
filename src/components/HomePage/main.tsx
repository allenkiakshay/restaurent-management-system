import React from "react";

const features = [
    {
        title: "Browse Restaurants",
        description: "Discover the best restaurants near you with a wide variety of cuisines.",
        icon: "🍽️",
    },
    {
        title: "Easy Ordering",
        description: "Order your favorite meals in just a few clicks with a seamless experience.",
        icon: "🛒",
    },
    {
        title: "Fast Delivery",
        description: "Get your food delivered hot and fresh, right at your doorstep.",
        icon: "🚚",
    },
];

export default function MainContent() {
    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
            fontFamily: "Segoe UI, sans-serif",
        }}>
            <header style={{
                padding: "2rem 0",
                textAlign: "center",
                background: "rgba(255,255,255,0.85)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}>
                <h1 style={{
                    fontSize: "3rem",
                    fontWeight: 700,
                    color: "#ff7043",
                    margin: 0,
                }}>
                    Slooze Food Ordering
                </h1>
                <p style={{
                    fontSize: "1.3rem",
                    color: "#555",
                    marginTop: "1rem",
                }}>
                    Delicious meals delivered to your door. Fast, easy, and reliable.
                </p>
                <button style={{
                    marginTop: "2rem",
                    padding: "1rem 2.5rem",
                    fontSize: "1.1rem",
                    background: "#ff7043",
                    color: "#fff",
                    border: "none",
                    borderRadius: "2rem",
                    cursor: "pointer",
                    fontWeight: 600,
                    boxShadow: "0 4px 16px rgba(255,112,67,0.15)",
                    transition: "background 0.2s",
                }}
                onMouseOver={e => (e.currentTarget.style.background = "#ff5722")}
                onMouseOut={e => (e.currentTarget.style.background = "#ff7043")}
                >
                    Order Now
                </button>
            </header>

            <main style={{
                maxWidth: 1100,
                margin: "3rem auto",
                display: "flex",
                flexWrap: "wrap",
                gap: "2rem",
                justifyContent: "center",
            }}>
                {features.map((feature) => (
                    <div key={feature.title} style={{
                        background: "#fff",
                        borderRadius: "1.5rem",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                        padding: "2rem",
                        flex: "1 1 300px",
                        minWidth: 280,
                        maxWidth: 340,
                        textAlign: "center",
                    }}>
                        <div style={{
                            fontSize: "2.5rem",
                            marginBottom: "1rem",
                        }}>{feature.icon}</div>
                        <h2 style={{
                            fontSize: "1.4rem",
                            color: "#ff7043",
                            margin: "0 0 0.5rem 0",
                        }}>{feature.title}</h2>
                        <p style={{
                            color: "#666",
                            fontSize: "1rem",
                            margin: 0,
                        }}>{feature.description}</p>
                    </div>
                ))}
            </main>

            <footer style={{
                textAlign: "center",
                padding: "2rem 0 1rem 0",
                color: "#aaa",
                fontSize: "1rem",
            }}>
                &copy; {new Date().getFullYear()} Slooze. All rights reserved.
            </footer>
        </div>
    );
}