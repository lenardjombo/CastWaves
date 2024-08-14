
document.addEventListener('DOMContentLoaded', () => {
    const podcastCardsContainer = document.getElementById('podcast-cards');
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const themeToggle = document.getElementById('theme-toggle');

    // Fetch podcast data
    const fetchPodcasts = async (query = '') => {
        try {
            const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=podcast&limit=10`);
            const data = await response.json();
            displayPodcasts(data.results);
        } catch (error) {
            console.error('Error fetching podcasts:', error);
        }
    };

    // Display podcasts in cards
    const displayPodcasts = (podcasts) => {
        podcastCardsContainer.innerHTML = '';
        podcasts.forEach(podcast => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${podcast.artworkUrl600}" alt="${podcast.trackName}">
                <h5 class="card-title">${podcast.trackName}</h5>
                <p class="card-text">${podcast.collectionName}</p>
                <button class="listen-button" data-url="${podcast.feedUrl}">Listen</button>
                <audio class="audio-player" controls></audio>
                <div class="loading-spinner" hidden></div>
            `;
            podcastCardsContainer.appendChild(card);
        });

        // Add event listeners for "Listen" buttons
        document.querySelectorAll('.listen-button').forEach(button => {
            button.addEventListener('click', () => {
                const audioPlayer = button.nextElementSibling;
                const spinner = button.nextElementSibling.nextElementSibling;
                const feedUrl = button.getAttribute('data-url');

                // Toggle loading spinner
                if (audioPlayer.src === '') {
                    spinner.hidden = false;
                    fetch(feedUrl)
                        .then(response => response.text())
                        .then(xml => {
                            const parser = new DOMParser();
                            const xmlDoc = parser.parseFromString(xml, 'text/xml');
                            const enclosure = xmlDoc.querySelector('enclosure');
                            const audioUrl = enclosure ? enclosure.getAttribute('url') : null;

                            if (audioUrl) {
                                audioPlayer.src = audioUrl;
                                audioPlayer.play();
                                button.textContent = 'Stop';
                            } else {
                                console.error('No audio URL found in the feed.');
                            }
                            spinner.hidden = true;
                        })
                        .catch(error => {
                            console.error('Error fetching audio URL:', error);
                            spinner.hidden = true;
                        });
                } else {
                    if (audioPlayer.paused) {
                        audioPlayer.play();
                        button.textContent = 'Stop';
                    } else {
                        audioPlayer.pause();
                        button.textContent = 'Listen';
                    }
                }

                // Add event listener for when the audio starts playing
                audioPlayer.addEventListener('playing', () => {
                    spinner.hidden = true;
                });

                // Handle case where audio fails to load
                audioPlayer.addEventListener('error', () => {
                    spinner.hidden = true;
                });
            });
        });
    };

    // Handle search button click
    searchButton.addEventListener('click', () => {
        const query = searchInput.value;
        fetchPodcasts(query);
    });

    // Toggle dark theme
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
    });

    // Load top podcasts initially with a default query
    fetchPodcasts('programming');
});
