// ==UserScript==
// @name         Bilibili分享优化
// @description  劫持Bilibili分享按钮，直接提取分享文本，让分享更加清爽
// @updateURL    https://raw.githubusercontent.com/doublebobcat/Bilibili-Share-Optimization/master/bilibili-share-optimization.user.js
// @downloadURL  https://raw.githubusercontent.com/doublebobcat/Bilibili-Share-Optimization/master/bilibili-share-optimization.user.js
// @version      0.7
// @author       DoubleCat
// @copyright    2025, DoubleCat (https://github.com/doublebobcat)
// @match        https://www.bilibili.com/video/*
// @license      GPL_V3
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @icon         https://raw.githubusercontent.com/doublebobcat/Bilibili-Share-Optimization/master/images/logo-small.png
// @icon64       https://raw.githubusercontent.com/doublebobcat/Bilibili-Share-Optimization/master/images/logo.png
// ==/UserScript==

(function () {
    'use strict';

    // 默认样式配置
    const defaultStyles = {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        color: '#000',
        padding: '12px 18px',
        borderRadius: '6px',
        zIndex: 9999,
        fontSize: '16px',
        transition: 'opacity 0.5s ease',
        opacity: '1'
    };

    // 默认功能配置
    const defaultConfig = {
        maxChars: 70,
        maxLines: 4,
        showOtherMembers: false,
        maxMembers: 3,
        darkMode: false
    };

    let styles = { ...defaultStyles };
    let config = { ...defaultConfig };

    // 从存储加载样式配置
    function loadStyles() {
        try {
            const saved = GM_getValue('messageStyles');
            return saved ? JSON.parse(saved) : { ...defaultStyles };
        } catch (err) {
            return { ...defaultStyles };
        }
    }

    // 保存样式配置
    function saveStyles(s) {
        GM_setValue('messageStyles', JSON.stringify(s));
    }

    // 从存储加载功能配置
    function loadConfig() {
        try {
            const saved = GM_getValue('shareConfig');
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...defaultConfig, ...parsed };
            }
            return { ...defaultConfig };
        } catch (err) {
            return { ...defaultConfig };
        }
    }

    // 保存功能配置
    function saveConfig(c) {
        GM_setValue('shareConfig', JSON.stringify(c));
    }

    // 设置窗口样式（使用 GM_addStyle 强约束，避免被页面样式干扰）
    GM_addStyle(`
        #bso-settings-dialog * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        #bso-settings-dialog {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,.5);
            z-index: 100000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #bso-settings-panel {
            border-radius: 8px;
            padding: 24px;
            width: 380px;
            box-shadow: 0 4px 20px rgba(0,0,0,.3);
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.5;
        }
        #bso-settings-panel.bso-light {
            background: #fff;
            color: #18191c;
        }
        #bso-settings-panel.bso-dark {
            background: #1a1a1a;
            color: #e0e0e0;
        }
        #bso-settings-panel .bso-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        #bso-settings-panel .bso-title {
            font-size: 16px;
            font-weight: 600;
        }
        #bso-settings-panel .bso-close {
            cursor: pointer;
            font-size: 20px;
            line-height: 1;
            opacity: 0.6;
            transition: opacity 0.2s;
        }
        #bso-settings-panel .bso-close:hover {
            opacity: 1;
        }
        #bso-settings-panel .bso-section {
            margin-bottom: 16px;
        }
        #bso-settings-panel .bso-section-title {
            font-weight: 600;
            margin-bottom: 12px;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        #bso-settings-panel.bso-light .bso-section-title { color: #666; }
        #bso-settings-panel.bso-dark .bso-section-title { color: #999; }
        #bso-settings-panel .bso-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
        }
        #bso-settings-panel input[type="number"],
        #bso-settings-panel input[type="text"] {
            width: 80px;
            padding: 6px 10px;
            border-radius: 4px;
            text-align: center;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
        }
        #bso-settings-panel.bso-light input[type="number"],
        #bso-settings-panel.bso-light input[type="text"] {
            background: #fff;
            color: #18191c;
            border: 1px solid #ddd;
        }
        #bso-settings-panel.bso-light input[type="number"]:focus,
        #bso-settings-panel.bso-light input[type="text"]:focus {
            border-color: #00a1d6;
        }
        #bso-settings-panel.bso-dark input[type="number"],
        #bso-settings-panel.bso-dark input[type="text"] {
            background: #2a2a2a;
            color: #e0e0e0;
            border: 1px solid #444;
        }
        #bso-settings-panel.bso-dark input[type="number"]:focus,
        #bso-settings-panel.bso-dark input[type="text"]:focus {
            border-color: #00a1d6;
        }
        #bso-settings-panel input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
            accent-color: #00a1d6;
        }
        #bso-settings-panel input[type="color"] {
            width: 40px;
            height: 30px;
            border: none;
            cursor: pointer;
            background: none;
        }
        #bso-settings-panel .bso-save-btn {
            padding: 8px 24px;
            background: #00a1d6;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
        }
        #bso-settings-panel .bso-save-btn:hover {
            background: #0090c0;
        }
    `);

    function extractWithXPath(xpathExpression) {
        const result = document.evaluate(xpathExpression, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return result.singleNodeValue ? result.singleNodeValue.textContent : '未找到';
    }

    async function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (err) {
                console.warn('[Bilibili-Share-Optimization] Clipboard API 失败，回退到 execCommand');
            }
        }
        // fallback
        const tempInput = document.createElement('textarea');
        tempInput.style.position = 'absolute';
        tempInput.style.left = '-9999px';
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        return true;
    }

    // 获取联合投稿的所有成员
    function getMembersInfo() {
        const membersInfo = document.querySelector('.membersinfo-normal');
        if (!membersInfo) return null;

        const staffCards = membersInfo.querySelectorAll('.membersinfo-upcard');
        const members = [];
        let mainUp = null;

        for (const card of staffCards) {
            const nameEl = card.querySelector('.staff-name');
            const tag = card.querySelector('.info-tag');
            if (!nameEl) continue;

            const name = nameEl.textContent.trim();
            const role = tag ? tag.textContent.trim() : '';

            if (role === 'UP主') {
                mainUp = name;
            }
            members.push({ name, role });
        }

        return { mainUp, members };
    }

    // 获取UP主昵称（支持单UP和多UP联合投稿场景）
    function getUpNickname() {
        // 尝试多UP联合投稿场景
        const membersInfo = getMembersInfo();
        if (membersInfo && membersInfo.mainUp) {
            return membersInfo.mainUp;
        }

        // 尝试单UP场景
        let nickname = extractWithXPath('/html/body/div[2]/div[2]/div[2]/div/div[1]/div[1]/div[2]/div[1]/div/div[1]/a[1]').trim();
        if (nickname === '直播中') {
            nickname = extractWithXPath('/html/body/div[2]/div[2]/div[2]/div/div[1]/div[1]/div[2]/div[1]/div/div[1]/a[2]').trim();
        }
        return nickname;
    }

    // 获取联合投稿其它成员文本
    function getOtherMembersText() {
        if (!config.showOtherMembers) return '';

        const membersInfo = getMembersInfo();
        if (!membersInfo || membersInfo.members.length <= 1) return '';

        const others = membersInfo.members.filter(m => m.role !== 'UP主');
        if (others.length === 0) return '';

        const max = config.maxMembers;
        let display = others.slice(0, max).map(m => m.name);
        let suffix = others.length > max ? ` 等${others.length}人` : '';

        return display.join('、') + suffix;
    }

    function copyInfo() {
        const pageURL = window.location.href;
        const title = extractWithXPath('/html/body/div[2]/div[2]/div[1]/div[1]/div[1]/div/h1').trim();
        const nickname = getUpNickname();
        let description = extractWithXPath('/html/body/div[2]/div[2]/div[1]/div[4]/div/span').trim();

        // 截断简介
        let lines = description.split(/\r?\n/);
        if (description.length > config.maxChars || lines.length > config.maxLines) {
            let truncated = description.substring(0, config.maxChars);
            let truncatedLines = truncated.split(/\r?\n/).slice(0, config.maxLines);
            description = truncatedLines.join("\n") + "......";
        }

        // 构建分享文本
        let parts = [`URL: ${pageURL}`, `UP主: ${nickname}`];

        // 联合投稿其它成员
        const otherMembers = getOtherMembersText();
        if (otherMembers) {
            parts.push(`协作者: ${otherMembers}`);
        }

        parts.push(`标题: ${title}`, `简介: ${description}`);
        const combinedInfo = parts.join('\n');

        copyToClipboard(combinedInfo);

        const copiedMessage = document.createElement('div');
        copiedMessage.textContent = '已复制';

        for (const [property, value] of Object.entries(styles)) {
            copiedMessage.style[property] = value;
        }

        document.body.appendChild(copiedMessage);

        setTimeout(() => {
            if (copiedMessage.parentNode) {
                copiedMessage.parentNode.removeChild(copiedMessage);
            }
        }, 3000);
    }

    // 页面加载完毕->劫持分享按钮
    const observer = new MutationObserver(() => {
        const shareBtn = document.querySelector('#share-btn-outer');
        if (shareBtn) {
            styles = loadStyles();
            config = loadConfig();

            // 移除原有点击事件
            shareBtn.replaceWith(shareBtn.cloneNode(true));
            const newShareBtn = document.querySelector('#share-btn-outer');

            // 添加自有点击事件
            newShareBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                copyInfo();
            });

            console.log('[Bilibili-Share-Optimization] 已劫持B站分享按钮');
            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 添加菜单项
    GM_registerMenuCommand("Bilibili分享优化 - 设置", openSettingsWindow);

    // 设置窗口
    function openSettingsWindow() {
        // 移除已存在的设置窗口
        const existing = document.getElementById('bso-settings-dialog');
        if (existing) existing.remove();

        // 加载当前配置
        const s = loadStyles();
        const c = loadConfig();
        const isDark = c.darkMode;
        const themeClass = isDark ? 'bso-dark' : 'bso-light';

        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.id = 'bso-settings-dialog';

        // 创建面板
        const panel = document.createElement('div');
        panel.id = 'bso-settings-panel';
        panel.className = themeClass;

        panel.innerHTML = `
            <div class="bso-header">
                <span class="bso-title">Bilibili分享优化 - 设置</span>
                <span class="bso-close" id="bso-settings-close">&times;</span>
            </div>

            <div class="bso-section">
                <div class="bso-section-title">显示设置</div>
                <label class="bso-row">
                    <span>暗色模式</span>
                    <input type="checkbox" id="bso-dark-mode" ${isDark ? 'checked' : ''}>
                </label>
            </div>

            <div class="bso-section">
                <div class="bso-section-title">简介截断</div>
                <div class="bso-row">
                    <span>最大字符数</span>
                    <input type="number" id="bso-max-chars" value="${c.maxChars}" min="10" max="500">
                </div>
                <div class="bso-row">
                    <span>最大行数</span>
                    <input type="number" id="bso-max-lines" value="${c.maxLines}" min="1" max="20">
                </div>
            </div>

            <div class="bso-section">
                <div class="bso-section-title">联合投稿</div>
                <label class="bso-row">
                    <span>展示其它UP主</span>
                    <input type="checkbox" id="bso-show-members" ${c.showOtherMembers ? 'checked' : ''}>
                </label>
                <div class="bso-row">
                    <span>最多展示人数</span>
                    <input type="number" id="bso-max-members" value="${c.maxMembers}" min="1" max="20">
                </div>
            </div>

            <div class="bso-section">
                <div class="bso-section-title">通知样式</div>
                <div class="bso-row">
                    <span>背景颜色</span>
                    <input type="color" id="bso-bg-color" value="${s.backgroundColor}">
                </div>
                <div class="bso-row">
                    <span>字体颜色</span>
                    <input type="color" id="bso-font-color" value="${s.color}">
                </div>
                <div class="bso-row">
                    <span>字体大小</span>
                    <input type="number" id="bso-font-size" value="${parseInt(s.fontSize)}" min="10" max="30">
                </div>
            </div>

            <div style="text-align:right;">
                <button class="bso-save-btn" id="bso-settings-save">保存</button>
            </div>
        `;

        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        // 暗色模式切换（实时预览）
        document.getElementById('bso-dark-mode').addEventListener('change', function() {
            panel.className = this.checked ? 'bso-dark' : 'bso-light';
        });

        // 关闭事件
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.remove();
        });
        document.getElementById('bso-settings-close').addEventListener('click', function() {
            overlay.remove();
        });

        // 保存事件
        document.getElementById('bso-settings-save').addEventListener('click', function() {
            // 保存功能配置
            const newConfig = {
                maxChars: parseInt(document.getElementById('bso-max-chars').value) || defaultConfig.maxChars,
                maxLines: parseInt(document.getElementById('bso-max-lines').value) || defaultConfig.maxLines,
                showOtherMembers: document.getElementById('bso-show-members').checked,
                maxMembers: parseInt(document.getElementById('bso-max-members').value) || defaultConfig.maxMembers,
                darkMode: document.getElementById('bso-dark-mode').checked
            };
            saveConfig(newConfig);
            config = newConfig;

            // 保存样式配置
            const newStyles = {
                ...s,
                backgroundColor: document.getElementById('bso-bg-color').value,
                color: document.getElementById('bso-font-color').value,
                fontSize: document.getElementById('bso-font-size').value + 'px'
            };
            saveStyles(newStyles);
            styles = newStyles;

            overlay.remove();
        });
    }
})();
