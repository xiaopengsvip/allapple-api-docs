import { useMemo, useState } from 'react'
import './index.css'

const API_BASE = 'https://v.api.allapple.top'

const apiEndpoints = [
  {
    category: '认证',
    icon: '🔐',
    endpoints: [
      {
        method: 'POST',
        path: '/api/auth/login',
        description: '用户登录，获取 JWT 令牌',
        auth: false,
        params: [
          { name: 'password', type: 'string', required: true, desc: 'API 密码' }
        ],
        requestExample: `{
  "password": "your_password"
}`,
        responseExample: `{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs..."
}`
      }
    ]
  },
  {
    category: '配置管理',
    icon: '⚙️',
    endpoints: [
      {
        method: 'GET',
        path: '/api/config',
        description: '获取当前 API 配置信息（脱敏）',
        auth: true,
        params: [],
        responseExample: `{
  "success": true,
  "config": {
    "github_username": "xiaopengsvip",
    "cloudflare_zone_id": "34ba07...",
    "has_github": true,
    "has_vercel": true,
    "has_cloudflare": true
  }
}`
      },
      {
        method: 'POST',
        path: '/api/config',
        description: '更新 API Token 配置',
        auth: true,
        params: [
          { name: 'github_token', type: 'string', required: false, desc: 'GitHub Personal Access Token' },
          { name: 'vercel_token', type: 'string', required: false, desc: 'Vercel API Token' },
          { name: 'cloudflare_token', type: 'string', required: false, desc: 'Cloudflare API Token' }
        ],
        requestExample: `{
  "github_token": "ghp_xxx",
  "vercel_token": "vcp_xxx",
  "cloudflare_token": "cfut_xxx"
}`,
        responseExample: `{
  "success": true
}`
      }
    ]
  },
  {
    category: '项目管理',
    icon: '📦',
    endpoints: [
      {
        method: 'GET',
        path: '/api/projects',
        description: '获取所有项目（合并 GitHub + Vercel 数据）',
        auth: true,
        params: [],
        responseExample: `{
  "success": true,
  "projects": [
    {
      "name": "allapple.new",
      "description": "AllApple 官网 v2.0",
      "github_updated": "2026-04-13T12:00:00Z",
      "github_pushed": "2026-04-13T12:00:00Z",
      "private": false,
      "github_url": "https://github.com/xiaopengsvip/allapple.new",
      "branch": "main",
      "vercel_name": "allapple-new",
      "framework": "vite"
    }
  ],
  "total": 17
}`
      }
    ]
  },
  {
    category: '域名管理',
    icon: '🌐',
    endpoints: [
      {
        method: 'GET',
        path: '/api/domains',
        description: '获取所有 Cloudflare DNS 记录',
        auth: true,
        params: [],
        responseExample: `{
  "success": true,
  "records": [
    {
      "id": "abc123",
      "name": "allapple.top",
      "type": "A",
      "content": "43.167.213.143",
      "proxied": true,
      "ttl": 1,
      "created": "2026-01-01T00:00:00Z"
    }
  ],
  "total": 13
}`
      },
      {
        method: 'POST',
        path: '/api/domains',
        description: '创建新的 DNS 记录',
        auth: true,
        params: [
          { name: 'name', type: 'string', required: true, desc: '完整域名 (如 sub.allapple.top)' },
          { name: 'type', type: 'string', required: true, desc: '记录类型 (A/CNAME/TXT/MX)' },
          { name: 'content', type: 'string', required: true, desc: '记录值' },
          { name: 'proxied', type: 'boolean', required: false, desc: '是否启用 Cloudflare 代理 (默认 true)' }
        ],
        requestExample: `{
  "name": "new.allapple.top",
  "type": "CNAME",
  "content": "cname.vercel-dns.com",
  "proxied": true
}`,
        responseExample: `{
  "success": true,
  "record": { "id": "new123", "name": "new.allapple.top" }
}`
      },
      {
        method: 'DELETE',
        path: '/api/domains/:id',
        description: '删除指定 DNS 记录',
        auth: true,
        params: [
          { name: 'id', type: 'string', required: true, desc: 'DNS 记录 ID' }
        ],
        responseExample: `{
  "success": true
}`
      }
    ]
  },
  {
    category: 'Vercel 管理',
    icon: '▲',
    endpoints: [
      {
        method: 'GET',
        path: '/api/vercel/projects',
        description: '获取所有 Vercel 项目列表',
        auth: true,
        params: [],
        responseExample: `{
  "success": true,
  "projects": [
    {
      "name": "allapple-new",
      "framework": "vite",
      "updated": 1713000000000,
      "repo": "allapple.new",
      "type": "github"
    }
  ]
}`
      }
    ]
  },
  {
    category: 'GitHub 管理',
    icon: '🐙',
    endpoints: [
      {
        method: 'GET',
        path: '/api/github/repos',
        description: '获取所有 GitHub 仓库列表',
        auth: true,
        params: [],
        responseExample: `{
  "success": true,
  "repos": [
    {
      "name": "allapple.new",
      "description": "官网 v2.0",
      "html_url": "https://github.com/xiaopengsvip/allapple.new",
      "updated_at": "2026-04-13T12:00:00Z",
      "private": false
    }
  ]
}`
      },
      {
        method: 'GET',
        path: '/api/github/repos/:name',
        description: '获取仓库详情和最近 10 条提交',
        auth: true,
        params: [
          { name: 'name', type: 'string', required: true, desc: '仓库名称' }
        ],
        responseExample: `{
  "success": true,
  "repo": { "name": "allapple.new", "description": "官网" },
  "commits": [
    { "sha": "abc123", "commit": { "message": "Update homepage" } }
  ]
}`
      },
      {
        method: 'GET',
        path: '/api/github/repos/:name/contents',
        description: '获取仓库根目录文件列表',
        auth: true,
        params: [
          { name: 'name', type: 'string', required: true, desc: '仓库名称' }
        ],
        responseExample: `{
  "success": true,
  "contents": [
    { "name": "src", "type": "dir" },
    { "name": "package.json", "type": "file" }
  ]
}`
      }
    ]
  },
  {
    category: '站点监控',
    icon: '📊',
    endpoints: [
      {
        method: 'GET',
        path: '/api/status',
        description: '健康检查所有子域名站点',
        auth: true,
        params: [],
        responseExample: `{
  "success": true,
  "summary": {
    "total": 13,
    "live": 12,
    "error": 1,
    "timeout": 0
  },
  "checks": [
    {
      "hostname": "allapple.top",
      "status": "live",
      "code": 200,
      "time": 234,
      "title": "AllApple - AI System Architect"
    }
  ]
}`
      }
    ]
  },
  {
    category: '系统信息',
    icon: '🖥️',
    endpoints: [
      {
        method: 'GET',
        path: '/api/system',
        description: '获取服务器系统信息',
        auth: true,
        params: [],
        responseExample: `{
  "success": true,
  "system": {
    "uptime": "up 3 days, 5 hours",
    "memory": "1.2G/2.0G",
    "disk": "8.5G/25G (36%)",
    "cpu": "2 cores",
    "load": "0.15 0.10 0.05"
  }
}`
      }
    ]
  },
  {
    category: '仪表盘',
    icon: '🎛️',
    endpoints: [
      {
        method: 'GET',
        path: '/api/dashboard',
        description: '获取聚合仪表盘数据（GitHub + Cloudflare + Vercel）',
        auth: true,
        params: [],
        responseExample: `{
  "success": true,
  "stats": {
    "totalRepos": 17,
    "totalDns": 15,
    "totalVercel": 12,
    "subdomains": 13
  },
  "subdomains": [
    {
      "subdomain": "allapple.top",
      "shortName": "@",
      "dnsType": "A",
      "dnsContent": "43.167.213.143",
      "proxied": true,
      "githubRepo": "allapple-pc",
      "vercelProject": "allapple-new",
      "framework": "vite",
      "lastPush": "2026-04-13T12:00:00Z"
    }
  ],
  "repos": [...],
  "dns": [...]
}`
      }
    ]
  }
]

function MethodBadge({ method }) {
  return <span className={`method-pill method-${method.toLowerCase()}`}>{method}</span>
}

function ParamTable({ params }) {
  if (!params?.length) return <div className="muted-mini">无请求参数</div>

  return (
    <div className="param-table-wrap">
      <table className="param-table">
        <thead>
          <tr>
            <th>参数</th>
            <th>类型</th>
            <th>必填</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          {params.map((p, i) => (
            <tr key={`${p.name}-${i}`}>
              <td><span className="param-name">{p.name}</span></td>
              <td><span className="param-type">{p.type}</span></td>
              <td>{p.required ? <span className="required-badge">必填</span> : <span className="optional-badge">可选</span>}</td>
              <td>{p.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EndpointCard({ endpoint }) {
  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState(endpoint.requestExample ? 'request' : 'response')

  return (
    <article className="endpoint-card" id={endpoint.path.replace(/[^a-zA-Z0-9]/g, '-')}>
      <button className="endpoint-head" onClick={() => setExpanded(!expanded)}>
        <MethodBadge method={endpoint.method} />
        <code className="endpoint-path">{endpoint.path}</code>
        <div className="endpoint-tags">
          {endpoint.auth && <span className="auth-tag">JWT</span>}
          <span className="endpoint-toggle">{expanded ? '收起' : '展开'}</span>
        </div>
      </button>

      <div className="endpoint-desc">{endpoint.description}</div>

      {expanded && (
        <div className="endpoint-body">
          <ParamTable params={endpoint.params} />

          <div className="tab-row">
            {endpoint.requestExample && (
              <button className={`tab-btn ${activeTab === 'request' ? 'active' : ''}`} onClick={() => setActiveTab('request')}>
                请求示例
              </button>
            )}
            <button className={`tab-btn ${activeTab === 'response' ? 'active' : ''}`} onClick={() => setActiveTab('response')}>
              响应示例
            </button>
          </div>

          <pre className="code-block">
            {activeTab === 'request' && endpoint.requestExample ? endpoint.requestExample : endpoint.responseExample}
          </pre>
        </div>
      )}
    </article>
  )
}

function App() {
  const [activeCategory, setActiveCategory] = useState('全部')
  const [query, setQuery] = useState('')

  const categoryList = ['全部', ...apiEndpoints.map((c) => c.category)]

  const flatEndpoints = useMemo(() => {
    const rows = []
    for (const cat of apiEndpoints) {
      for (const ep of cat.endpoints) {
        rows.push({ ...ep, category: cat.category, icon: cat.icon })
      }
    }
    return rows
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return flatEndpoints.filter((ep) => {
      const hitCategory = activeCategory === '全部' || ep.category === activeCategory
      if (!hitCategory) return false
      if (!q) return true
      return (
        ep.path.toLowerCase().includes(q) ||
        ep.description.toLowerCase().includes(q) ||
        ep.method.toLowerCase().includes(q) ||
        ep.category.toLowerCase().includes(q)
      )
    })
  }, [flatEndpoints, activeCategory, query])

  const totalEndpoints = flatEndpoints.length
  const authEndpoints = flatEndpoints.filter((ep) => ep.auth).length

  return (
    <div className="docs-shell">
      <div className="noise" />

      <aside className="sidebar">
        <div className="brand-box">
          <div className="brand-logo">🍎</div>
          <div>
            <div className="brand-title">AllApple API Docs</div>
            <div className="brand-sub">v2.0 • Neon Developer Experience</div>
          </div>
        </div>

        <div className="quick-stats">
          <div><span>Base URL</span><code>{API_BASE}</code></div>
          <div><span>接口总数</span><strong>{totalEndpoints}</strong></div>
          <div><span>需认证</span><strong>{authEndpoints}</strong></div>
        </div>

        <nav className="nav-list">
          {categoryList.map((cat) => (
            <button
              key={cat}
              className={`nav-item ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </nav>
      </aside>

      <main className="content">
        <section className="hero-panel">
          <div>
            <p className="eyebrow">Production-Ready API Platform</p>
            <h1>为 docs.allapple.top 全面升级主流炫酷 UI/UX</h1>
            <p className="hero-desc">
              采用暗色玻璃 + 霓虹渐变 + 结构化信息架构。支持快速筛选、分类浏览、接口展开查看、请求/响应示例切换。
            </p>
          </div>

          <div className="search-box">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索 path / method / 描述 / 分类..."
            />
          </div>
        </section>

        <section className="endpoint-grid">
          {filtered.map((ep) => (
            <EndpointCard key={`${ep.method}-${ep.path}`} endpoint={ep} />
          ))}
        </section>
      </main>
    </div>
  )
}

export default App
