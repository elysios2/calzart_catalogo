document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (postId) {
        await loadBlogPost(postId);
    } else {
        document.getElementById('blog-post-content').innerHTML = '<p>Entrada de blog no encontrada.</p>';
    }
});

async function loadBlogPost(postId) {
    try {
        const response = await fetch('blogPosts.json');
        const data = await response.json();
        const post = data.posts.find(p => p.id === parseInt(postId));

        if (post) {
            renderBlogPost(post);
        } else {
            document.getElementById('blog-post-content').innerHTML = '<p>Entrada de blog no encontrada.</p>';
        }
    } catch (err) {
        console.error("Error fetching blog post:", err);
        document.getElementById('blog-post-content').innerHTML = '<p>Error al cargar la entrada del blog.</p>';
    }
}

function renderBlogPost(post) {
    const container = document.getElementById('blog-post-content');
    
    const titleElement = document.createElement('h1');
    titleElement.className = 'text-4xl font-bold text-gray-800 mb-6';
    titleElement.textContent = post.title;

    const metaElement = document.createElement('div');
    metaElement.className = 'text-gray-600 mb-6';
    metaElement.innerHTML = `Por ${post.author} | ${post.date}`;

    const imageElement = document.createElement('img');
    imageElement.src = post.image;
    imageElement.alt = post.title;
    imageElement.className = 'w-full h-96 object-cover rounded-lg mb-6';

    const contentElement = document.createElement('div');
    contentElement.className = 'text-gray-700 leading-relaxed space-y-4';
    contentElement.innerHTML = `
        <p>${post.content}</p>
        <p>Mantente actualizado con las últimas tendencias y consejos sobre calzado de cuero.</p>
    `;

    container.innerHTML = ''; // Clear previous content
    container.appendChild(titleElement);
    container.appendChild(metaElement);
    container.appendChild(imageElement);
    container.appendChild(contentElement);
}