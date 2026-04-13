import { useState } from 'react'
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
  return <span className={`method-badge method-${method.toLowerCase()}`}>{method}</span>
}

function ParamTable({ params }) {
  if (!params || params.length === 0) return null
  return (
    <table className="param-table">
      <thead>
        <tr>
          <th>参数名</th>
          <th>类型</th>
          <th>必填</th>
          <th>说明</th>
        </tr>
      </thead>
      <tbody>
        {params.map((p, i) => (
          <tr key={i}>
            <td><span className="param-name">{p.name}</span></td>
            <td><span className="param-type">{p.type}</span></td>
            <td>{p.required ? <span className="required-badge">必填</span> : <span className="optional-badge">可选</span>}</td>
            <td>{p.desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function EndpointCard({ endpoint }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="glass-card" style={{ marginBottom: '16px' }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <MethodBadge method={endpoint.method} />
        <code style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '14px',
          color: 'var(--text-primary)',
          flex: 1
        }}>
          {endpoint.path}
        </code>
        {endpoint.auth && (
          <span style={{
            fontSize: '11px',
            color: 'var(--accent)',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            🔑 需要认证
          </span>
        )}
        <span style={{
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s',
          color: 'var(--text-secondary)',
          fontSize: '12px'
        }}>
          ▼
        </span>
      </div>

      <div style={{
        padding: '0 20px',
        fontSize: '14px',
        color: 'var(--text-secondary)',
        paddingBottom: expanded ? 0 : '16px'
      }}>
        {endpoint.description}
      </div>

      {expanded && (
        <div style={{ padding: '0 20px 20px' }}>
          <div className="glow-line" style={{ margin: '12px 0' }}></div>

          <ParamTable params={endpoint.params} />

          {endpoint.requestExample && (
            <div style={{ marginTop: '16px' }}>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                请求体
              </div>
              <pre className="code-block" style={{ margin: 0 }}>
                {endpoint.requestExample}
              </pre>
            </div>
          )}

          <div style={{ marginTop: '16px' }}>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              响应示例
            </div>
            <pre className="code-block" style={{ margin: 0 }}>
              {endpoint.responseExample}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  const [activeNav, setActiveNav] = useState('overview')
  const totalEndpoints = apiEndpoints.reduce((acc, cat) => acc + cat.endpoints.length, 0)
  const authEndpoints = apiEndpoints.reduce((acc, cat) => acc + cat.endpoints.filter(e => e.auth).length, 0)

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <nav style={{
        width: '260px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        padding: '24px 0',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <div style={{ padding: '0 20px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent), #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}>
              🍎
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>AllApple API</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>v1.0.0</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 12px' }}>
          <div
            onClick={() => setActiveNav('overview')}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '4px',
              background: activeNav === 'overview' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeNav === 'overview' ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
          >
            📋 概览
          </div>

          {apiEndpoints.map((cat, i) => (
            <div key={i}>
              <div style={{
                padding: '12px 12px 6px',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                fontWeight: 600
              }}>
                {cat.icon} {cat.category}
              </div>
              {cat.endpoints.map((ep, j) => (
                <div
                  key={j}
                  onClick={() => setActiveNav(`${i}-${j}`)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginBottom: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: activeNav === `${i}-${j}` ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <span className={`method-badge method-${ep.method.toLowerCase()}`} style={{
                    fontSize: '9px',
                    padding: '1px 6px',
                    minWidth: '40px'
                  }}>
                    {ep.method}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: activeNav === `${i}-${j}` ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontFamily: "'JetBrains Mono', monospace",
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {ep.path.replace('/api/', '')}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px'
        }}>
          <div className="glow-line"></div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center' }}>
            AllApple Backend API<br />
            <span style={{ color: 'var(--accent)' }}>43.167.213.143:8641</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ marginLeft: '260px', flex: 1, padding: '40px 48px' }}>
        {activeNav === 'overview' ? (
          <>
            {/* Hero */}
            <div style={{ marginBottom: '48px' }}>
              <h1 style={{
                fontSize: '42px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '12px'
              }}>
                AllApple Backend API
              </h1>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '600px' }}>
                统一管理 GitHub、Vercel、Cloudflare 的后端 API 服务。
                提供项目管理、域名管理、站点监控等一站式接口。
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '48px' }}>
              {[
                { label: '接口总数', value: totalEndpoints, icon: '🔗' },
                { label: '需认证', value: authEndpoints, icon: '🔑' },
                { label: '分类', value: apiEndpoints.length, icon: '📂' },
                { label: '版本', value: '1.0.0', icon: '🏷️' }
              ].map((stat, i) => (
                <div key={i} className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent)' }}>{stat.value}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Quick Start */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>🚀 快速开始</h2>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  1. 登录获取 Token
                </div>
                <pre className="code-block">{`curl -X POST ${API_BASE}/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"password": "your_password"}'`}</pre>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  2. 使用 Token 调用接口
                </div>
                <pre className="code-block">{`curl ${API_BASE}/api/dashboard \\
  -H "Authorization: Bearer <your_token>"`}</pre>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Base URL
                </div>
                <pre className="code-block" style={{ color: 'var(--accent)' }}>{API_BASE}</pre>
              </div>
            </div>

            {/* Auth Info */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>🔐 认证方式</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
                除登录接口外，所有接口均需要在请求头中携带 JWT Token：
              </p>
              <pre className="code-block">{`Authorization: Bearer <your_jwt_token>`}</pre>
              <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <div>• Token 有效期：<span style={{ color: 'var(--accent)' }}>7 天</span></div>
                <div>• 签名算法：<span style={{ color: 'var(--accent)' }}>HS256</span></div>
                <div>• 过期后需重新登录获取新 Token</div>
              </div>
            </div>

            {/* Endpoint List */}
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px' }}>📋 所有接口</h2>
            {apiEndpoints.map((cat, i) => (
              <div key={i} style={{ marginBottom: '32px' }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>{cat.icon}</span> {cat.category}
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    ({cat.endpoints.length} 个接口)
                  </span>
                </h3>
                {cat.endpoints.map((ep, j) => (
                  <EndpointCard key={j} endpoint={ep} />
                ))}
              </div>
            ))}
          </>
        ) : (
          /* Single endpoint view */
          (() => {
            const [catIdx, epIdx] = activeNav.split('-').map(Number)
            const cat = apiEndpoints[catIdx]
            const ep = cat?.endpoints[epIdx]
            if (!ep) return null
            return (
              <>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {cat.icon} {cat.category}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <MethodBadge method={ep.method} />
                    <code style={{ fontSize: '20px', fontFamily: "'JetBrains Mono', monospace" }}>
                      {ep.path}
                    </code>
                  </div>
                  <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>{ep.description}</p>
                </div>
                <EndpointCard endpoint={ep} />
              </>
            )
          })()
        )}

        {/* Footer */}
        <div className="glow-line" style={{ marginTop: '60px' }}></div>
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '12px' }}>
          AllApple Backend API © 2026 — AI System Architect<br />
          Powered by Express.js + JWT + PM2
        </div>
      </main>
    </div>
  )
}

export default App
