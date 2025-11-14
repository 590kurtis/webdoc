document.addEventListener('DOMContentLoaded', () => {

    const exhibitionData = {
        "entree": {
            name: "1. Entrée de l'Exposition",
            artworks: [
                { id: "oeuvre01", title: "LE BOSS", date: "c. 1892", image_url: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Eug%C3%A8ne_Carri%C3%A8re_-_Maternity_-_Google_Art_Project.jpg", audio_url: "" },
                { id: "oeuvre02", title: "PREMIERE EOVRE ", date: "c. 1898", image_url: "https://www.parismuseescollections.paris.fr/sites/default/files/atoms/images/PPM/1024/ppp01083-2.jpg", audio_url: "" }
            ]
        },
        "wtv1": { name: "2. Salle de l'Intimité", artworks: [] },
        "wtv2": { name: "3. Salle des Portraits", artworks: [] },
        "wtv3": { name: "4. Salle des Scènes Familiales", artworks: [] },
        "wtv4": { name: "5. Salle de la Lumière", artworks: [] },
        "fin-parcours": { name: "6. Fin du Parcours", artworks: [] }
    };
    const tourOrder = ["entree", "wtv1", "wtv2", "wtv3", "wtv4", "fin-parcours"];

    // --- GESTION DE LA NAVIGATION ---
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main section');
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href').substring(1) === entry.target.id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.5 });
    sections.forEach(section => navObserver.observe(section));

    // --- ANIMATION DU PLAN ---
    const mapContainer = document.querySelector('.map-container-grid');
    const planObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            const allRooms = document.querySelectorAll('.room');
            allRooms.forEach((room, index) => {
                setTimeout(() => { room.classList.add('animated'); }, index * 100);
            });
            planObserver.unobserve(mapContainer);
        }
    }, { threshold: 0.2 });
    planObserver.observe(mapContainer);

    // --- GESTION DE LA MODALE ---
    const modalContainer = document.getElementById('modal-container');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.querySelector('.close-modal');
    const roomDivs = document.querySelectorAll('.room-interactive');

    const getVisitedRooms = () => JSON.parse(localStorage.getItem('visitedRooms')) || [];
    const setVisitedRoom = (roomId) => {
        let visited = getVisitedRooms();
        if (!visited.includes(roomId)) {
            visited.push(roomId);
            localStorage.setItem('visitedRooms', JSON.stringify(visited));
        }
    };
    
    const applyVisitedState = () => {
        getVisitedRooms().forEach(roomId => {
            document.getElementById(roomId)?.classList.add('visited');
        });
    };
    applyVisitedState();

    const openModalForRoom = (roomId) => {
        const roomData = exhibitionData[roomId];
        if (roomData) {
            displayRoomGallery(roomData, roomId);
            modalContainer.classList.add('show');
            document.getElementById(roomId)?.classList.add('visited');
            setVisitedRoom(roomId);
        }
    };

    roomDivs.forEach(room => {
        room.addEventListener('click', () => openModalForRoom(room.dataset.room));
    });

    const closeModal = () => {
        modalContainer.classList.remove('show');
        modalBody.innerHTML = '';
    };
    closeModalBtn.addEventListener('click', closeModal);
    modalContainer.addEventListener('click', (e) => e.target === modalContainer && closeModal());
    
    function displayRoomGallery(roomData, roomId) {
        let content = `<h3>${roomData.name}</h3>`;
        if (roomData.artworks && roomData.artworks.length > 0) {
            content += '<div class="room-gallery">';
            roomData.artworks.forEach(artwork => {
                content += `<div class="artwork-thumbnail" data-room-id="${roomId}" data-artwork-id="${artwork.id}"><img src="${artwork.image_url}" alt="${artwork.title}"><p>${artwork.title}</p></div>`;
            });
            content += '</div>';
        } else {
            content += '<p>//</p>';
        }
        modalBody.innerHTML = content;
        addModalNavigation(roomId);
        addThumbnailListeners();
    }

    function addModalNavigation(currentRoomId) {
        const currentIndex = tourOrder.indexOf(currentRoomId);
        const prevRoomId = currentIndex > 0 ? tourOrder[currentIndex - 1] : null;
        const nextRoomId = currentIndex < tourOrder.length - 1 ? tourOrder[currentIndex + 1] : null;
        let navHtml = '<div class="modal-navigation">';
        navHtml += prevRoomId ? `<button class="modal-nav-btn" data-target-room="${prevRoomId}">← Salle Précédente</button>` : '<div></div>';
        navHtml += nextRoomId ? `<button class="modal-nav-btn" data-target-room="${nextRoomId}">Salle Suivante →</button>` : '<div></div>';
        navHtml += '</div>';
        modalBody.insertAdjacentHTML('beforeend', navHtml);
         document.querySelectorAll('.modal-nav-btn[data-target-room]').forEach(btn => {
            btn.addEventListener('click', (e) => openModalForRoom(e.target.dataset.targetRoom));
        });
    }
    
    function addThumbnailListeners() {
        document.querySelectorAll('.artwork-thumbnail').forEach(thumb => {
            thumb.addEventListener('click', () => {
                const roomId = thumb.dataset.roomId;
                const artworkId = thumb.dataset.artworkId;
                const artworkData = exhibitionData[roomId].artworks.find(art => art.id === artworkId);
                if (artworkData) displayArtworkDetail(artworkData, roomId);
            });
        });
    }
    
    function displayArtworkDetail(artwork, roomId) {
        modalBody.innerHTML = `
            <div class="artwork-detail-view">
                <div class="artwork-image"><img src="${artwork.image_url}" alt="${artwork.title}"></div>
                <div class="artwork-info">
                    <h4>${artwork.title}</h4>
                    <p><strong>Auteur:</strong> Eugène Carrière</p>
                    <p><strong>Date:</strong> ${artwork.date}</p>
                    ${artwork.audio_url ? `<audio class="audio-player" controls src="${artwork.audio_url}"></audio>` : ''}
                    
                    <button class="back-to-gallery" data-room-id="${roomId}">Retour à la galerie de la salle</button>
                </div>
            </div>`;
        document.querySelector('.back-to-gallery').addEventListener('click', (e) => openModalForRoom(e.target.dataset.roomId));
    }
});