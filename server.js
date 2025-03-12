const express = require('express');
const axios = require('axios');
const cors = require('cors'); // 引入cors中间件
const app = express();
const port = 3000;

app.use(cors()); // 使用cors中间件，允许所有源的请求

// H3Yun API 客户端
class H3YunApiClient {
    constructor(engineCode, engineSecret) {
        this.engineCode = engineCode;
        this.engineSecret = engineSecret;
        this.baseURL = 'https://www.h3yun.com/OpenApi/Invoke';
    }

    // 创建基础请求配置
    getBaseConfig() {
        return {
            headers: {
                'EngineCode': this.engineCode,
                'EngineSecret': this.engineSecret,
                'Content-Type': 'application/json'
            }
        };
    }

    // 加载业务对象
    async loadBizObjects(schemaCode, options = {}) {
        const defaultFilter = {
            FromRowNum: 0,
            ToRowNum: 500,
            Matcher: {
                Type: "And",
                Matchers: [{
                    Type: "And",
                    Matchers: []
                }]
            },
            SortByCollection: [{
                ItemName: "CreatedTime",
                Direction: "Ascending"
            }],
            RequireCount: true,
            ReturnItems: []
        };

        const requestData = {
            ActionName: "LoadBizObjects",
            SchemaCode: schemaCode,
            Filter: JSON.stringify({
                ...defaultFilter,
                ...options
            })
        };

        try {
            const response = await axios.post(
                this.baseURL,
                requestData,
                this.getBaseConfig()
            );
            return response.data;
        } catch (error) {
            console.error('API请求错误:', error.message);
            throw error;
        }
    }
}

// 创建 H3Yun API 客户端实例
const client = new H3YunApiClient(
    'qrp5w0le4p0fahqmsbwu4ho61',  // 使用你自己的 EngineCode
    'tl5Dbkbn6S140poi1gyx+ezgCbJzkXf+81DQEetBIg9JGPnUh5KuKw=='  // 使用你自己的 EngineSecret
);

// 设置路由
app.get('/api/leaders', async (req, res) => {
    try {
        const result = await client.loadBizObjects('D2859543d80b9f144bd48f68caae9c5f40093ae');
        
        // 将返回的数据转换为领导数据格式
        const leadersData = result.ReturnData.BizObjectArray.map(item => ({
            name: item.F0000001 || item.Name,
            destination: item.F0000002 || "无具体描述",
            position: item.F0000003 || "未知职位",
            status: item.F0000004 || "未知状态",
            locationDN: item.locationDN || ""
        }));

        res.json(leadersData); // 返回领导数据
    } catch (error) {
        res.status(500).json({ error: '获取数据失败', details: error.message });
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});