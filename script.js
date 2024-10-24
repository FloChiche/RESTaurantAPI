const API_URL = 'http://localhost:3000';
let isAdmin = false;
let allItems = []; // Stocker tous les items ici

// Charger les éléments et stocker les items dans allItems
async function fetchItems() {
    const loadingElement = document.getElementById('loading');
    const menuContainer = document.getElementById('menu');
    loadingElement.style.display = 'block';
    menuContainer.innerHTML = '';

    try {
        const response = await fetch(`${API_URL}/items`);
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des données');
        }

        allItems = await response.json(); // Stocker tous les items globalement
        loadingElement.style.display = 'none';
        displayItems(allItems); // Afficher les items après le chargement
    } catch (error) {
        loadingElement.innerHTML = `
            <div class="error-message">
                Erreur lors du chargement du menu. Veuillez réessayer plus tard.
            </div>`;
        console.error('Erreur:', error);
    }
}

// Fonction pour afficher les items filtrés
function displayItems(items) {
    const menuContainer = document.getElementById('menu');
    menuContainer.innerHTML = '';

    if (!items || items.length === 0) {
        menuContainer.innerHTML = '<p>Aucun article disponible</p>';
        return;
    }

    items.forEach((item, index) => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.style.setProperty('--i', index + 1);

        const stockStatus = getStockStatus(item.quantity);
        const adminControls = isAdmin ? `
            <div class="admin-controls">
                <button onclick="editQuantity(${item.id}, ${item.quantity})" class="edit-btn">
                    Modifier quantité
                </button>
                <button onclick="deleteItem(${item.id}, this)" class="delete-btn">
                    Supprimer
                </button>
            </div>
        ` : '';

        itemCard.innerHTML = `
            <div class="item-content">
                <div class="item-header">
                    <div class="item-name">${item.name || 'Sans nom'}</div>
                    <div class="stock-status ${stockStatus.class}">${stockStatus.text}</div>
                </div>
                <div class="item-description">${item.description || 'Aucune description disponible'}</div>
                <div class="item-footer">
                    <div class="price-tag">${item.price ? item.price.toFixed(2) : 'N/A'}</div>
                    <div class="quantity-badge">
                        Quantité: <span>${item.quantity || 0}</span>
                    </div>
                </div>
                ${adminControls}
            </div>
        `;
        menuContainer.appendChild(itemCard);
    });
}

// Filtrer les items en fonction de la catégorie
function filterByCategory() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    
    if (selectedCategory === "") {
        // Si aucune catégorie sélectionnée, afficher tous les items
        displayItems(allItems);
    } else {
        // Filtrer les items par la catégorie sélectionnée
        const filteredItems = allItems.filter(item => item.category === selectedCategory);
        displayItems(filteredItems);
    }
}

// Vérification du statut d'administrateur
function checkAdminStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    isAdmin = !!user;
    updateUI();
}

// Mise à jour de l'interface utilisateur en fonction du rôle admin
function updateUI() {
    const adminPanel = document.getElementById('adminPanel');
    const loginBtn = document.getElementById('loginBtn');
    const navButtons = document.getElementById('navButtons');

    if (isAdmin) {
        adminPanel.style.display = 'block';
        navButtons.innerHTML = `
            <span class="admin-badge">Mode Administration</span>
            <button onclick="logout()" class="logout-button">Déconnexion</button>
        `;
    } else {
        adminPanel.style.display = 'none';
        navButtons.innerHTML = `
            <a href="login.html" class="admin-login">Administration</a>
        `;
    }
}

// Se déconnecter et rafraîchir la page
function logout() {
    localStorage.removeItem('user');
    isAdmin = false;
    updateUI();
    fetchItems(); 
}

// Déterminer l'état du stock
function getStockStatus(quantity) {
    if (quantity === 0) {
        return { class: 'out-of-stock', text: 'Rupture de stock' };
    } else if (quantity < 5) {
        return { class: 'low-stock', text: 'Stock limité' };
    }
    return { class: 'in-stock', text: 'En stock' };
}

// Initialiser la page
document.addEventListener('DOMContentLoaded', () => {
    checkAdminStatus();
    fetchItems();
});
