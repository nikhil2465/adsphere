import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  message,
  Dropdown,
  Menu,
  Row,
  Col,
  Statistic,
  Tabs,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  CopyOutlined,
  MoreOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { ColumnType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

interface Ad {
  id: string;
  name: string;
  campaign: string;
  platform: 'amazon' | 'walmart' | 'ebay' | 'shopify';
  type: string;
  status: 'active' | 'paused' | 'archived' | 'pending';
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roas: number;
  createdAt: string;
  updatedAt: string;
}

const AdsManager: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [selectedAds, setSelectedAds] = useState<string[]>([]);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');
  const queryClient = useQueryClient();

  // Mock data fetching
  const { data: ads = [], isLoading } = useQuery<Ad[]>(
    'ads',
    async () => {
      // This would be replaced with actual API call
      return [
        {
          id: '1',
          name: 'Summer Sale Campaign',
          campaign: 'Summer Promotion',
          platform: 'amazon',
          type: 'Sponsored Product',
          status: 'active',
          budget: 1000,
          spend: 450,
          impressions: 50000,
          clicks: 500,
          conversions: 25,
          ctr: 1.0,
          cpc: 0.90,
          roas: 3.5,
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20',
        },
        {
          id: '2',
          name: 'Holiday Special',
          campaign: 'Winter Campaign',
          platform: 'walmart',
          type: 'Sponsored Brand',
          status: 'paused',
          budget: 2000,
          spend: 800,
          impressions: 80000,
          clicks: 800,
          conversions: 40,
          ctr: 1.0,
          cpc: 1.00,
          roas: 4.0,
          createdAt: '2024-01-10',
          updatedAt: '2024-01-18',
        },
      ];
    }
  );

  const createAdMutation = useMutation(
    async (adData: Partial<Ad>) => {
      // API call to create ad
      console.log('Creating ad:', adData);
      return { id: Date.now().toString(), ...adData };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('ads');
        message.success('Ad created successfully');
        setIsModalVisible(false);
        form.resetFields();
      },
      onError: () => {
        message.error('Failed to create ad');
      },
    }
  );

  const updateAdMutation = useMutation(
    async ({ id, ...adData }: Partial<Ad> & { id: string }) => {
      // API call to update ad
      console.log('Updating ad:', id, adData);
      return { id, ...adData };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('ads');
        message.success('Ad updated successfully');
        setIsModalVisible(false);
        setEditingAd(null);
        form.resetFields();
      },
      onError: () => {
        message.error('Failed to update ad');
      },
    }
  );

  const deleteAdMutation = useMutation(
    async (id: string) => {
      // API call to delete ad
      console.log('Deleting ad:', id);
      return id;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('ads');
        message.success('Ad deleted successfully');
      },
      onError: () => {
        message.error('Failed to delete ad');
      },
    }
  );

  const handleCreateAd = () => {
    setEditingAd(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEditAd = (ad: Ad) => {
    setEditingAd(ad);
    setIsModalVisible(true);
    form.setFieldsValue(ad);
  };

  const handleDeleteAd = (id: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this ad?',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => deleteAdMutation.mutate(id),
    });
  };

  const handleToggleAdStatus = (ad: Ad) => {
    const newStatus = ad.status === 'active' ? 'paused' : 'active';
    updateAdMutation.mutate({ ...ad, status: newStatus });
  };

  const handleSubmit = (values: any) => {
    if (editingAd) {
      updateAdMutation.mutate({ ...editingAd, ...values });
    } else {
      createAdMutation.mutate(values);
    }
  };

  const exportToCSV = () => {
    const csvData = ads.map(ad => ({
      Name: ad.name,
      Campaign: ad.campaign,
      Platform: ad.platform,
      Type: ad.type,
      Status: ad.status,
      Budget: ad.budget,
      Spend: ad.spend,
      Impressions: ad.impressions,
      Clicks: ad.clicks,
      Conversions: ad.conversions,
      CTR: ad.ctr,
      CPC: ad.cpc,
      ROAS: ad.roas,
    }));

    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ads');
    XLSX.writeFile(wb, `ads_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    message.success('Exported to CSV successfully');
  };

  const exportToExcel = () => {
    const csvData = ads.map(ad => ({
      Name: ad.name,
      Campaign: ad.campaign,
      Platform: ad.platform,
      Type: ad.type,
      Status: ad.status,
      Budget: ad.budget,
      Spend: ad.spend,
      Impressions: ad.impressions,
      Clicks: ad.clicks,
      Conversions: ad.conversions,
      CTR: ad.ctr,
      CPC: ad.cpc,
      ROAS: ad.roas,
    }));

    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ads');
    XLSX.writeFile(wb, `ads_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    message.success('Exported to Excel successfully');
  };

  const exportToPDF = async () => {
    const element = document.getElementById('ads-table');
    if (element) {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`ads_export_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      message.success('Exported to PDF successfully');
    }
  };

  const menuItems = [
    {
      key: 'csv',
      label: 'Export to CSV',
      icon: <DownloadOutlined />,
      onClick: exportToCSV,
    },
    {
      key: 'excel',
      label: 'Export to Excel',
      icon: <DownloadOutlined />,
      onClick: exportToExcel,
    },
    {
      key: 'pdf',
      label: 'Export to PDF',
      icon: <DownloadOutlined />,
      onClick: exportToPDF,
    },
  ];

  const columns: ColumnType<Ad>[] = [
    {
      title: 'Ad Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Campaign',
      dataIndex: 'campaign',
      key: 'campaign',
    },
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      render: (platform: string) => (
        <Tag color={platform === 'amazon' ? 'orange' : platform === 'walmart' ? 'blue' : 'green'}>
          {platform.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : status === 'paused' ? 'orange' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Budget',
      dataIndex: 'budget',
      key: 'budget',
      render: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      title: 'Spend',
      dataIndex: 'spend',
      key: 'spend',
      render: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      title: 'Impressions',
      dataIndex: 'impressions',
      key: 'impressions',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Clicks',
      dataIndex: 'clicks',
      key: 'clicks',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'CTR',
      dataIndex: 'ctr',
      key: 'ctr',
      render: (value: number) => `${value.toFixed(2)}%`,
    },
    {
      title: 'ROAS',
      dataIndex: 'roas',
      key: 'roas',
      render: (value: number) => value.toFixed(2),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditAd(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? 'Pause' : 'Resume'}>
            <Button
              type="text"
              icon={record.status === 'active' ? <PauseOutlined /> : <PlayCircleOutlined />}
              onClick={() => handleToggleAdStatus(record)}
            />
          </Tooltip>
          <Tooltip title="Duplicate">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => {
                const newAd = { ...record, id: undefined, name: `${record.name} (Copy)` };
                createAdMutation.mutate(newAd);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteAd(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredAds = ads.filter(ad => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ad.status === 'active';
    if (activeTab === 'paused') return ad.status === 'paused';
    if (activeTab === 'archived') return ad.status === 'archived';
    return true;
  });

  const totalBudget = filteredAds.reduce((sum, ad) => sum + ad.budget, 0);
  const totalSpend = filteredAds.reduce((sum, ad) => sum + ad.spend, 0);
  const totalImpressions = filteredAds.reduce((sum, ad) => sum + ad.impressions, 0);
  const totalClicks = filteredAds.reduce((sum, ad) => sum + ad.clicks, 0);
  const totalConversions = filteredAds.reduce((sum, ad) => sum + ad.conversions, 0);

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Budget"
              value={totalBudget}
              prefix="$"
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Spend"
              value={totalSpend}
              prefix="$"
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Clicks"
              value={totalClicks}
              precision={0}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Conversions"
              value={totalConversions}
              precision={0}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Ads Manager"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateAd}
            >
              Create Ad
            </Button>
            <Dropdown menu={{ items: menuItems }} placement="bottomRight">
              <Button icon={<DownloadOutlined />}>
                Export
              </Button>
            </Dropdown>
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={`All Ads (${ads.length})`} key="all" />
          <TabPane tab={`Active (${ads.filter(ad => ad.status === 'active').length})`} key="active" />
          <TabPane tab={`Paused (${ads.filter(ad => ad.status === 'paused').length})`} key="paused" />
          <TabPane tab={`Archived (${ads.filter(ad => ad.status === 'archived').length})`} key="archived" />
        </Tabs>

        <div id="ads-table">
          <Table
            columns={columns}
            dataSource={filteredAds}
            rowKey="id"
            loading={isLoading}
            pagination={{
              total: filteredAds.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} ads`,
            }}
            rowSelection={{
              selectedRowKeys: selectedAds,
              onChange: setSelectedAds,
            }}
          />
        </div>
      </Card>

      <Modal
        title={editingAd ? 'Edit Ad' : 'Create New Ad'}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingAd(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Ad Name"
                rules={[{ required: true, message: 'Please enter ad name' }]}
              >
                <Input placeholder="Enter ad name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="campaign"
                label="Campaign"
                rules={[{ required: true, message: 'Please select campaign' }]}
              >
                <Select placeholder="Select campaign">
                  <Option value="Summer Promotion">Summer Promotion</Option>
                  <Option value="Winter Campaign">Winter Campaign</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="platform"
                label="Platform"
                rules={[{ required: true, message: 'Please select platform' }]}
              >
                <Select placeholder="Select platform">
                  <Option value="amazon">Amazon</Option>
                  <Option value="walmart">Walmart</Option>
                  <Option value="ebay">eBay</Option>
                  <Option value="shopify">Shopify</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="type"
                label="Ad Type"
                rules={[{ required: true, message: 'Please select ad type' }]}
              >
                <Select placeholder="Select ad type">
                  <Option value="Sponsored Product">Sponsored Product</Option>
                  <Option value="Sponsored Brand">Sponsored Brand</Option>
                  <Option value="Sponsored Display">Sponsored Display</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="active">Active</Option>
                  <Option value="paused">Paused</Option>
                  <Option value="draft">Draft</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="budget"
                label="Budget"
                rules={[{ required: true, message: 'Please enter budget' }]}
              >
                <Input
                  type="number"
                  prefix="$"
                  placeholder="Enter budget"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="landingUrl"
                label="Landing URL"
                rules={[
                  { required: true, message: 'Please enter landing URL' },
                  { type: 'url', message: 'Please enter a valid URL' }
                ]}
              >
                <Input placeholder="https://example.com" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter ad description"
            />
          </Form.Item>
          <Form.Item
            name="imageUrl"
            label="Ad Image"
          >
            <Upload
              listType="picture-card"
              beforeUpload={() => false}
              maxCount={1}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={createAdMutation.isLoading || updateAdMutation.isLoading}>
                {editingAd ? 'Update Ad' : 'Create Ad'}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                setEditingAd(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdsManager;
