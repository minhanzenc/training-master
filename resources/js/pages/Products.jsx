import { Button, Table } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

export default function Products() {
    const columns = [
        {
            title: '#',
            dataIndex: 'id',
            key: 'id',
            width: 60,
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
        },
    ]

    const data = []

    return (
        <div>
            <div className="p-6 bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold m-0">Danh sách sản phẩm</h2>
                    <Button type="primary" icon={<PlusOutlined />}>
                        Thêm mới
                    </Button>
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
