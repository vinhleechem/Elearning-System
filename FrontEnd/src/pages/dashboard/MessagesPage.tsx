import React, { useState } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Avatar,
    IconButton,
    TextField,
    InputAdornment,
    Chip,
    Badge,
    Divider,
    Menu,
    MenuItem,
    Tooltip,
} from '@mui/material';
import {
    Search as SearchIcon,
    Send as SendIcon,
    MoreVert as MoreVertIcon,
    Archive as ArchiveIcon,
    Unarchive as UnarchiveIcon,
    AttachFile as AttachFileIcon,
    EmojiEmotions as EmojiIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

// Mock data - sẽ thay bằng API call
const mockConversations = [
    {
        id: 1,
        courseName: 'Java Programming Masterclass',
        instructorName: 'Nguyễn Văn A',
        instructorAvatar: '/avatars/instructor1.jpg',
        lastMessage: 'Cảm ơn em đã tham gia khóa học. Chúc em học tốt!',
        lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        unreadCount: 2,
        isArchived: false,
    },
    {
        id: 2,
        courseName: 'React & TypeScript Complete Guide',
        instructorName: 'Trần Thị B',
        instructorAvatar: '/avatars/instructor2.jpg',
        lastMessage: 'Em có thể xem lại bài giảng về Hooks nhé',
        lastMessageAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        unreadCount: 0,
        isArchived: false,
    },
    {
        id: 3,
        courseName: 'Python for Data Science',
        instructorName: 'Lê Văn C',
        instructorAvatar: '/avatars/instructor3.jpg',
        lastMessage: 'Bài tập tuần này em làm rất tốt!',
        lastMessageAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        unreadCount: 0,
        isArchived: false,
    },
];

const mockMessages = [
    {
        id: 1,
        senderId: 1,
        senderName: 'Nguyễn Văn A',
        senderType: 'INSTRUCTOR',
        content: 'Chào em! Thầy thấy em có câu hỏi về bài học hôm nay?',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        isRead: true,
    },
    {
        id: 2,
        senderId: 2,
        senderName: 'Bạn',
        senderType: 'STUDENT',
        content: 'Dạ em chưa hiểu rõ về phần Inheritance ạ',
        createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
        isRead: true,
    },
    {
        id: 3,
        senderId: 1,
        senderName: 'Nguyễn Văn A',
        senderType: 'INSTRUCTOR',
        content: 'Được, thầy giải thích lại cho em nhé. Inheritance là kế thừa, cho phép class con kế thừa các thuộc tính và phương thức từ class cha.',
        createdAt: new Date(Date.now() - 2.3 * 60 * 60 * 1000),
        isRead: true,
    },
    {
        id: 4,
        senderId: 2,
        senderName: 'Bạn',
        senderType: 'STUDENT',
        content: 'Em hiểu rồi ạ! Vậy khi nào thì nên dùng Inheritance thầy?',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: true,
    },
    {
        id: 5,
        senderId: 1,
        senderName: 'Nguyễn Văn A',
        senderType: 'INSTRUCTOR',
        content: 'Cảm ơn em đã tham gia khóa học. Chúc em học tốt!',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: false,
    },
];

const MessagesPage: React.FC = () => {
    const [selectedConversation, setSelectedConversation] = useState<number | null>(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedConvForMenu, setSelectedConvForMenu] = useState<number | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, convId: number) => {
        setAnchorEl(event.currentTarget);
        setSelectedConvForMenu(convId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedConvForMenu(null);
    };

    const handleSendMessage = () => {
        if (messageInput.trim()) {
            console.log('Sending message:', messageInput);
            setMessageInput('');
        }
    };

    const filteredConversations = mockConversations.filter(
        (conv) =>
            conv.isArchived === showArchived &&
            (conv.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                conv.instructorName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const selectedConvData = mockConversations.find((c) => c.id === selectedConversation);

    return (
        <Container maxWidth="xl" sx={{ py: 4, height: 'calc(100vh - 100px)' }}>
            <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
                {/* Conversation List */}
                <Paper
                    elevation={3}
                    sx={{
                        width: 380,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        overflow: 'hidden',
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            p: 2.5,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                        }}
                    >
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                            💬 Tin nhắn
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Tìm kiếm cuộc trò chuyện..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: 'white' }} />
                                    </InputAdornment>
                                ),
                                sx: {
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    borderRadius: 2,
                                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                    '&::placeholder': { color: 'rgba(255,255,255,0.7)' },
                                },
                            }}
                        />
                    </Box>

                    {/* Tabs */}
                    <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
                        <Box
                            onClick={() => setShowArchived(false)}
                            sx={{
                                flex: 1,
                                py: 1.5,
                                textAlign: 'center',
                                cursor: 'pointer',
                                fontWeight: 600,
                                borderBottom: !showArchived ? 3 : 0,
                                borderColor: 'primary.main',
                                color: !showArchived ? 'primary.main' : 'text.secondary',
                                transition: 'all 0.3s',
                                '&:hover': { bgcolor: 'action.hover' },
                            }}
                        >
                            Hoạt động ({mockConversations.filter((c) => !c.isArchived).length})
                        </Box>
                        <Box
                            onClick={() => setShowArchived(true)}
                            sx={{
                                flex: 1,
                                py: 1.5,
                                textAlign: 'center',
                                cursor: 'pointer',
                                fontWeight: 600,
                                borderBottom: showArchived ? 3 : 0,
                                borderColor: 'primary.main',
                                color: showArchived ? 'primary.main' : 'text.secondary',
                                transition: 'all 0.3s',
                                '&:hover': { bgcolor: 'action.hover' },
                            }}
                        >
                            Lưu trữ ({mockConversations.filter((c) => c.isArchived).length})
                        </Box>
                    </Box>

                    {/* Conversation List */}
                    <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                        {filteredConversations.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                                <Typography>Không có cuộc trò chuyện nào</Typography>
                            </Box>
                        ) : (
                            filteredConversations.map((conv) => (
                                <Box
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv.id)}
                                    sx={{
                                        p: 2,
                                        display: 'flex',
                                        gap: 2,
                                        cursor: 'pointer',
                                        bgcolor: selectedConversation === conv.id ? 'action.selected' : 'transparent',
                                        borderLeft: selectedConversation === conv.id ? 4 : 0,
                                        borderColor: 'primary.main',
                                        transition: 'all 0.2s',
                                        '&:hover': { bgcolor: 'action.hover' },
                                    }}
                                >
                                    <Badge
                                        badgeContent={conv.unreadCount}
                                        color="error"
                                        overlap="circular"
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    >
                                        <Avatar
                                            src={conv.instructorAvatar}
                                            alt={conv.instructorName}
                                            sx={{ width: 56, height: 56 }}
                                        />
                                    </Badge>

                                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="subtitle2" fontWeight={700} noWrap>
                                                {conv.instructorName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatDistanceToNow(conv.lastMessageAt, { addSuffix: true, locale: vi })}
                                            </Typography>
                                        </Box>
                                        <Typography
                                            variant="caption"
                                            color="primary"
                                            sx={{
                                                display: 'block',
                                                mb: 0.5,
                                                fontWeight: 600,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            📚 {conv.courseName}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                fontWeight: conv.unreadCount > 0 ? 600 : 400,
                                            }}
                                        >
                                            {conv.lastMessage}
                                        </Typography>
                                    </Box>

                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMenuOpen(e, conv.id);
                                        }}
                                    >
                                        <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))
                        )}
                    </Box>
                </Paper>

                {/* Chat Window */}
                {selectedConversation ? (
                    <Paper
                        elevation={3}
                        sx={{
                            flexGrow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 3,
                            overflow: 'hidden',
                        }}
                    >
                        {/* Chat Header */}
                        <Box
                            sx={{
                                p: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                borderBottom: 1,
                                borderColor: 'divider',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                            }}
                        >
                            <Avatar
                                src={selectedConvData?.instructorAvatar}
                                alt={selectedConvData?.instructorName}
                                sx={{ width: 48, height: 48 }}
                            />
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" fontWeight={700}>
                                    {selectedConvData?.instructorName}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                    📚 {selectedConvData?.courseName}
                                </Typography>
                            </Box>
                            <Tooltip title="Tùy chọn">
                                <IconButton sx={{ color: 'white' }}>
                                    <MoreVertIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        {/* Messages Area */}
                        <Box
                            sx={{
                                flexGrow: 1,
                                p: 3,
                                overflow: 'auto',
                                bgcolor: '#f5f7fa',
                                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                            }}
                        >
                            {mockMessages.map((msg, index) => {
                                const isInstructor = msg.senderType === 'INSTRUCTOR';
                                const showAvatar =
                                    index === 0 || mockMessages[index - 1].senderType !== msg.senderType;

                                return (
                                    <Box
                                        key={msg.id}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: isInstructor ? 'flex-start' : 'flex-end',
                                            mb: 2,
                                            gap: 1,
                                        }}
                                    >
                                        {isInstructor && (
                                            <Avatar
                                                src={selectedConvData?.instructorAvatar}
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    visibility: showAvatar ? 'visible' : 'hidden',
                                                }}
                                            />
                                        )}
                                        <Box
                                            sx={{
                                                maxWidth: '70%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: isInstructor ? 'flex-start' : 'flex-end',
                                            }}
                                        >
                                            {showAvatar && (
                                                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, px: 1 }}>
                                                    {msg.senderName}
                                                </Typography>
                                            )}
                                            <Paper
                                                elevation={1}
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    bgcolor: isInstructor ? 'white' : 'primary.main',
                                                    color: isInstructor ? 'text.primary' : 'white',
                                                    borderTopLeftRadius: isInstructor && showAvatar ? 0 : 16,
                                                    borderTopRightRadius: !isInstructor && showAvatar ? 0 : 16,
                                                }}
                                            >
                                                <Typography variant="body2">{msg.content}</Typography>
                                            </Paper>
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, px: 1 }}>
                                                {formatDistanceToNow(msg.createdAt, { addSuffix: true, locale: vi })}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* Message Input */}
                        <Box
                            sx={{
                                p: 2,
                                borderTop: 1,
                                borderColor: 'divider',
                                bgcolor: 'white',
                            }}
                        >
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                                <Tooltip title="Đính kèm file">
                                    <IconButton size="small" color="primary">
                                        <AttachFileIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Emoji">
                                    <IconButton size="small" color="primary">
                                        <EmojiIcon />
                                    </IconButton>
                                </Tooltip>
                                <TextField
                                    fullWidth
                                    multiline
                                    maxRows={4}
                                    placeholder="Nhập tin nhắn..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                        },
                                    }}
                                />
                                <IconButton
                                    color="primary"
                                    onClick={handleSendMessage}
                                    disabled={!messageInput.trim()}
                                    sx={{
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'primary.dark' },
                                        '&:disabled': { bgcolor: 'action.disabledBackground' },
                                    }}
                                >
                                    <SendIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    </Paper>
                ) : (
                    <Paper
                        elevation={3}
                        sx={{
                            flexGrow: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 3,
                            bgcolor: '#f5f7fa',
                        }}
                    >
                        <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                            <Typography variant="h5" gutterBottom>
                                💬
                            </Typography>
                            <Typography variant="h6">Chọn một cuộc trò chuyện để bắt đầu</Typography>
                        </Box>
                    </Paper>
                )}
            </Box>

            {/* Context Menu */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleMenuClose}>
                    <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
                    Lưu trữ
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                    <UnarchiveIcon fontSize="small" sx={{ mr: 1 }} />
                    Bỏ lưu trữ
                </MenuItem>
            </Menu>
        </Container>
    );
};

export default MessagesPage;
