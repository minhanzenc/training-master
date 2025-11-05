import { Button, Table, Input, Space } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'

export default function Customers() {
    const columns = [
        {
            title: '#',
            dataIndex: 'id',
            key: 'id',
            width: 60,
        },
        {
            title: 'Họ và tên',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'Điện thoại',
            dataIndex: 'phone',
            key: 'phone',
        },
    ]

    const data = []

    return (
        <div>
            <div className="p-6 bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold m-0">Danh sách khách hàng</h2>
                    <Space>
                        <Input 
                            placeholder="Tìm kiếm..." 
                            prefix={<SearchOutlined />}
                            style={{ width: 200 }}
                        />
                        <Button type="primary" icon={<PlusOutlined />}>
                            Thêm mới
                        </Button>
                    </Space>
                </div>
                
                <Table 
                    columns={columns} 
                    dataSource={data}
                    pagination={{ pageSize: 10 }}
                    bordered
                />
            </div>
        </div>
    )
}
