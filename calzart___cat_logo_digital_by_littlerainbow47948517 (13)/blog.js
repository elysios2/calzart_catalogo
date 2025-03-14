document.addEventListener('DOMContentLoaded', async () => {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    await loadBlogPosts();
});

async function loadBlogPosts() {
    try {
        const response = await fetch('blogPosts.json');
        const data = await response.json();
        const posts = data.posts;

        const container = document.getElementById('blog-container');
        container.innerHTML = ''; 

        if (posts && posts.length > 0) {
            posts.forEach(post => {
                const postElement = createBlogPostCard(post);
                container.appendChild(postElement);
            });
        } else {
            container.innerHTML = '<p>No se encontraron entradas de blog.</p>';
        }
    } catch (err) {
        console.error("Unexpected error fetching blog posts:", err);
    }
}

function createBlogPostCard(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'bg-white rounded-lg shadow-md overflow-hidden transition duration-300 hover:shadow-xl';

    const img = document.createElement('img');
    img.src = post.image;
    img.alt = post.title;
    img.className = 'w-full h-48 object-cover';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'p-6';

    const title = document.createElement('h3');
    title.className = 'text-xl font-semibold text-gray-800 mb-2';
    title.textContent = post.title;

    const metaInfo = document.createElement('div');
    metaInfo.className = 'text-sm text-gray-600 mb-4';
    metaInfo.innerHTML = `Por ${post.author} | ${post.date}`;

    const excerpt = document.createElement('p');
    excerpt.className = 'text-gray-700 mb-4';
    excerpt.textContent = post.excerpt;

    const readMoreLink = document.createElement('a');
    readMoreLink.href = `blog-post.html?id=${post.id}`;
    readMoreLink.className = 'text-blue-500 hover:underline';
    readMoreLink.textContent = 'Leer más';

    contentDiv.appendChild(title);
    contentDiv.appendChild(metaInfo);
    contentDiv.appendChild(excerpt);
    contentDiv.appendChild(readMoreLink);

    postDiv.appendChild(img);
    postDiv.appendChild(contentDiv);

    return postDiv;
}

