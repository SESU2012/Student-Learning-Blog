   // Sample posts (you can add/edit from the editor)
    const samplePosts = [
      {
        id: 'sci-1',
        title: 'Why the Sky is Blue (Simple Explanation)',
        category: 'Science',
        excerpt: 'A compact explanation of Rayleigh scattering — why molecules make the sky blue and sunsets red.',
        img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop&crop=entropy',
        date: '2025-10-10',
        content: `<p>Sunlight is made of many colors. When sunlight hits the atmosphere, small gas molecules scatter the shorter (blue) wavelengths more than the longer (red) wavelengths. That scattered blue light is what you see when you look up.</p>
                  <h3>Quick demo</h3>
                  <p>Try shining white light through tiny particles — blue scatters more.</p>`
      },
      {
        id: 'code-1',
        title: 'Build a To‑Do App in 20 Minutes (Vanilla JS)',
        category: 'Coding',
        excerpt: 'A step-by-step guide to making a simple to-do app with localStorage and accessibility in mind.',
        img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop&crop=entropy',
        date: '2025-09-04',
        content: `<p>This tutorial walks through core concepts: DOM manipulation, event handling, and saving state with localStorage.</p>
                  <pre><code>// pseudo code
const list = []
// add, remove, render
</code></pre>`
      },
      {
        id: 'life-1',
        title: '5 Study Habits That Actually Work',
        category: 'Lifestyle',
        excerpt: 'Evidence-based study techniques that improve retention and reduce burnout.',
        img: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop&crop=entropy',
        date: '2025-08-21',
        content: `<ol><li>Spacing</li><li>Active recall</li><li>Interleaving</li><li>Good sleep</li><li>Short focused sessions</li></ol>`
      },
      {
        id: 'code-2',
        title: 'Intro to Python: Your First Script',
        category: 'Coding',
        excerpt: 'Write, run, and understand your first Python program — no install required (online options).',
        img: 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=800&auto=format&fit=crop&crop=entropy',
        date: '2025-07-12',
        content: `<p>print('Hello world') is the classic first program. Learn variables, types, and functions.</p>`
      }
    ];

    // state
    let posts = JSON.parse(localStorage.getItem('sl_posts') || 'null') || samplePosts;
    const grid = document.getElementById('postsGrid');
    const tpl = document.getElementById('cardTpl');
    const searchInput = document.getElementById('search');
    const cats = Array.from(document.querySelectorAll('.cat'));
    const countEl = document.getElementById('count');
    const modal = document.getElementById('modal');
    const readerContent = document.getElementById('readerContent');
    const sortSelect = document.getElementById('sortSelect');

    function renderCards(filterText = '', filterCat = 'All'){
      grid.innerHTML = '';
      let list = posts.slice();
      // filter
      if(filterText){
        const q = filterText.toLowerCase();
        list = list.filter(p => (p.title+p.excerpt+p.content).toLowerCase().includes(q));
      }
      if(filterCat && filterCat !== 'All') list = list.filter(p => p.category === filterCat);

      // sort
      const sort = sortSelect.value;
      list.sort((a,b)=> sort === 'new' ? (new Date(b.date)-new Date(a.date)) : (new Date(a.date)-new Date(b.date)));

      countEl.textContent = list.length;

      list.forEach(p => {
        const node = tpl.content.cloneNode(true);
        node.querySelector('img').src = p.img;
        node.querySelector('img').alt = p.title;
        node.querySelector('.kicker').textContent = p.category;
        node.querySelector('.title').textContent = p.title;
        node.querySelector('.excerpt').textContent = p.excerpt;
        node.querySelector('.date').textContent = new Date(p.date).toLocaleDateString();
        node.querySelector('.card').addEventListener('click', ()=> openReader(p.id));
        grid.appendChild(node);
      });

      if(list.length === 0){
        grid.innerHTML = '<div style="grid-column:1/-1;padding:22px;color:var(--muted)">No posts found. Try a different search or category.</div>'
      }
    }

    function openReader(id){
      const p = posts.find(x=>x.id===id);
      if(!p) return;
      readerContent.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
          <div>
            <div style="font-size:13px;color:var(--muted)">${p.category} • ${new Date(p.date).toLocaleDateString()}</div>
            <h2>${p.title}</h2>
          </div>
        </div>
        <div class="heroimg" style="margin-top:12px;margin-bottom:12px"><img src="${p.img}" style="width:100%;height:100%;object-fit:cover;border-radius:8px"/></div>
        <div style="line-height:1.6">${p.content}</div>
        <div style="margin-top:18px;display:flex;gap:8px;justify-content:flex-end">
          <button class="btn" onclick="editPost('${p.id}')">Edit</button>
          <button class="btn" onclick="deletePost('${p.id}')">Delete</button>
        </div>
      `;
      modal.classList.add('open');
    }

    function closeModal(){ modal.classList.remove('open'); }
    document.getElementById('closeModal').addEventListener('click', closeModal);
    modal.addEventListener('click', (e)=>{ if(e.target===modal) closeModal(); });

    // Category clicks
    cats.forEach(c=>c.addEventListener('click', ()=>{
      cats.forEach(x=>x.classList.remove('active'));
      c.classList.add('active');
      renderCards(searchInput.value, c.dataset.cat);
    }));

    // search input
    searchInput.addEventListener('input', ()=>{
      const active = document.querySelector('.cat.active').dataset.cat;
      renderCards(searchInput.value, active);
    });

    sortSelect.addEventListener('change', ()=>{
      const active = document.querySelector('.cat.active').dataset.cat;
      renderCards(searchInput.value, active);
    });

    // New post button (simple editor)
    document.getElementById('new-post').addEventListener('click', ()=>{
      openEditor();
    });

    function openEditor(post){
      const isEdit = !!post;
      const id = post ? post.id : ('post-'+Date.now());
      readerContent.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
          <h2>${isEdit? 'Edit Post' : 'New Post'}</h2>
        </div>
        <div style="margin-top:12px;display:grid;gap:10px">
          <input id="eTitle" placeholder="Title" value="${post?escapeHtml(post.title):''}" style="padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.04);background:transparent;color:inherit" />
          <input id="eImage" placeholder="Image URL (optional)" value="${post?escapeHtml(post.img):''}" style="padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.04);background:transparent;color:inherit" />
          <select id="eCat"><option>Science</option><option>Coding</option><option>Lifestyle</option></select>
          <textarea id="eContent" rows="8" placeholder="Write post HTML here (you can use basic tags like &lt;p&gt;&lt;h3&gt;&lt;ol&gt;&lt;pre&gt;&lt;code&gt;)">${post?escapeHtml(post.content):''}</textarea>
          <div style="display:flex;gap:8px;justify-content:flex-end">
            <button class="btn" onclick="closeModal()">Cancel</button>
            <button class="btn primary" id="saveBtn">Save</button>
          </div>
        </div>
      `;
      // set category
      setTimeout(()=>{
        if(post) document.getElementById('eCat').value = post.category;
        document.getElementById('saveBtn').addEventListener('click', ()=>{
          const newPost = {
            id,
            title: document.getElementById('eTitle').value || 'Untitled',
            img: document.getElementById('eImage').value || 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=800&auto=format&fit=crop&crop=entropy',
            category: document.getElementById('eCat').value,
            excerpt: (document.getElementById('eContent').value || '').slice(0,120) + '...',
            date: new Date().toISOString().slice(0,10),
            content: document.getElementById('eContent').value || '<p>No content</p>'
          };
          savePost(newPost);
          closeModal();
        });
      }, 50);
      modal.classList.add('open');
    }

    // helpers for edit/delete
    window.editPost = function(id){
      const p = posts.find(x=>x.id===id);
      if(!p) return;
      openEditor(p);
    }
    window.deletePost = function(id){
      if(!confirm('Delete this post?')) return;
      posts = posts.filter(x=>x.id!==id);
      persist();
      closeModal();
      const active = document.querySelector('.cat.active').dataset.cat;
      renderCards(searchInput.value, active);
    }

    function savePost(post){
      const exists = posts.find(x=>x.id===post.id);
      if(exists){
        posts = posts.map(x=> x.id===post.id ? post : x);
      } else {
        posts.unshift(post);
      }
      persist();
      const active = document.querySelector('.cat.active').dataset.cat;
      renderCards(searchInput.value, active);
    }

    function persist(){ localStorage.setItem('sl_posts', JSON.stringify(posts)); }

    // Utilities
    function escapeHtml(str){ return (str||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }

    // Clear filters
    document.getElementById('clear-filters').addEventListener('click', ()=>{
      searchInput.value='';
      document.querySelector('.cat.active').classList.remove('active');
      document.querySelector('.cat[data-cat="All"]').classList.add('active');
      renderCards();
    });

    // initial render
    renderCards();

    // small accessibility: Esc to close
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); });

    // small tip: expose posts to window for debugging
    window.__SL = {posts, savePost, render: renderCards};