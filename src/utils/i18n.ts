export type Language = 'vi' | 'en';

const LANG_STORAGE_KEY = 'lingoquest_language';

export function getStoredLanguage(): Language {
  const saved = localStorage.getItem(LANG_STORAGE_KEY);
  if (saved === 'vi' || saved === 'en') return saved;
  return 'vi'; // Default to Vietnamese
}

export function saveStoredLanguage(lang: Language): void {
  localStorage.setItem(LANG_STORAGE_KEY, lang);
}

export const translations = {
  vi: {
    // Navbar
    brandName: 'LingoQuest',
    studentView: 'Giao diện Học sinh',
    adminView: 'Quản lý Giáo viên',

    // Student Dashboard
    heroTitle: 'Học Tiếng Anh Tương Tác',
    heroSubtitle: 'Luyện tập từ vựng, ngữ pháp và cấu trúc câu thông qua các bài tập tương tác sinh động.',
    searchPlaceholder: 'Tìm kiếm chủ đề, từ khóa bài học...',
    topicsAvailable: 'Chủ đề',
    startLearning: 'Bắt đầu học',
    completed: 'Đã hoàn thành',
    highScore: 'Điểm cao',
    gamesCount: 'Bài tập',
    noTopicsFound: 'Không tìm thấy bài học nào phù hợp.',

    // Game Engines
    question: 'Câu hỏi',
    matchingTitle: 'Nối từ tương ứng',
    checkAnswer: 'Kiểm tra',
    nextQuestion: 'Câu tiếp theo →',
    finishSection: 'Hoàn thành phần học →',
    continue: 'Tiếp tục →',
    wellDone: 'Rất tốt!',
    keepPracticing: 'Cố gắng lên nhé!',
    correctSentence: 'Câu đúng là:',
    allPairsMatched: 'Đã nối thành công tất cả các cặp từ!',
    totalAttempts: 'Số lần thử:',
    terms: 'Từ tiếng Anh',
    meanings: 'Nghĩa tiếng Việt',
    yourSentence: 'Câu của bạn:',
    clickBlocks: 'Bấm các khối từ bên dưới để ghép thành câu',
    availableBlocks: 'Các khối từ có sẵn:',
    clearAll: 'Xóa làm lại',
    perfectArrangement: 'Ghép câu hoàn toàn chính xác!',
    incorrectOrder: 'Thứ tự chưa đúng!',
    clickWrongWord: '💡 Bấm vào từ bị sai trong câu bên trên để sửa lại.',
    greatEye: 'Tuyệt vời! Bạn đã phát hiện và sửa đúng lỗi sai.',
    notQuiteRight: 'Chưa chính xác!',
    submitCorrection: 'Gửi từ đã sửa',
    correctSpelling: 'Đánh vần chính xác!',
    incorrectSpelling: 'Chưa đúng chính tả!',
    checkWord: 'Kiểm tra từ',
    showHint: 'Hiện gợi ý',
    hideHint: 'Ẩn gợi ý',
    streak: 'Chuỗi đúng!',
    pts: 'điểm',

    // Lesson Summary
    lessonCompleted: 'Hoàn thành bài học!',
    totalScore: 'Tổng điểm',
    accuracy: 'Độ chính xác',
    peakStreak: 'Chuỗi đúng cao nhất',
    completionTime: 'Thời gian hoàn thành',
    tryAgain: 'Học lại',
    backToTopics: 'Về danh sách chủ đề',

    // Admin Authentication & Dashboard
    teacherLoginTitle: 'Đăng Nhập Giáo Viên',
    teacherLoginSubtitle: 'Nhập tài khoản và mật khẩu quản trị để quản lý bài học',
    usernameLabel: 'Tên đăng nhập',
    passwordLabel: 'Mật khẩu',
    loginBtn: 'Đăng nhập',
    invalidCredentials: 'Tên đăng nhập hoặc mật khẩu không chính xác!',
    logOut: 'Đăng xuất',
    changePassword: 'Đổi mật khẩu',
    adminTitle: 'Bảng Quản Lý Bài Học',
    adminSubtitle: 'Tạo mới, chỉnh sửa bài tập và quản lý danh sách các chủ đề học tập.',
    jsonImportExport: 'Nhập / Xuất JSON',
    createLesson: 'Tạo bài học mới',
    topicTitle: 'Tên chủ đề',
    category: 'Phân loại',
    actions: 'Thao tác',
    edit: 'Sửa',
    copy: 'Sao chép',
    delete: 'Xóa',
    moveUp: 'Lên',
    moveDown: 'Xuống',
    confirmDelete: 'Bạn có chắc chắn muốn xóa bài học này không?',

    // Change Password Modal
    changePasswordTitle: 'Đổi Mật Khẩu Quản Trị',
    currentPassword: 'Mật khẩu hiện tại',
    newPassword: 'Mật khẩu mới',
    confirmNewPassword: 'Xác nhận mật khẩu mới',
    saveNewPassword: 'Lưu mật khẩu mới',
    cancel: 'Hủy',
    passwordChangedSuccess: 'Đổi mật khẩu thành công!',
    passwordsDoNotMatch: 'Mật khẩu mới và xác nhận mật khẩu không khớp!',
    incorrectCurrentPassword: 'Mật khẩu hiện tại không đúng!',

    // Game types labels
    clozeLabel: 'Điền từ',
    matchingLabel: 'Nối từ',
    sentenceLabel: 'Xếp câu',
    errorSpotterLabel: 'Sửa lỗi',
    wordScrambleLabel: 'Xếp chữ',
  },
  en: {
    // Navbar
    brandName: 'LingoQuest',
    studentView: 'Student View',
    adminView: 'Teacher Admin',

    // Student Dashboard
    heroTitle: 'Interactive English Learning',
    heroSubtitle: 'Practice vocabulary, grammar, and sentence structures through dynamic interactive exercises.',
    searchPlaceholder: 'Search topics, lesson keywords...',
    topicsAvailable: 'Topics',
    startLearning: 'Start Learning',
    completed: 'Completed',
    highScore: 'High Score',
    gamesCount: 'Exercises',
    noTopicsFound: 'No topics match your search criteria.',

    // Game Engines
    question: 'Question',
    matchingTitle: 'Match Corresponding Pairs',
    checkAnswer: 'Check Answer',
    nextQuestion: 'Next Question →',
    finishSection: 'Finish Section →',
    continue: 'Continue →',
    wellDone: 'Well done!',
    keepPracticing: 'Keep practicing!',
    correctSentence: 'Correct sentence:',
    allPairsMatched: 'All pairs matched successfully!',
    totalAttempts: 'Total attempts:',
    terms: 'English Terms',
    meanings: 'Vietnamese Meanings',
    yourSentence: 'Your Sentence:',
    clickBlocks: 'Click blocks below to form the sentence',
    availableBlocks: 'Available Blocks:',
    clearAll: 'Clear All',
    perfectArrangement: 'Perfect arrangement!',
    incorrectOrder: 'Incorrect order!',
    clickWrongWord: '💡 Click on the incorrect word in the sentence above to fix it.',
    greatEye: 'Great eye! You spotted and fixed the error.',
    notQuiteRight: 'Not quite right!',
    submitCorrection: 'Submit Correction',
    correctSpelling: 'Correct Spelling!',
    incorrectSpelling: 'Incorrect Spelling!',
    checkWord: 'Check Word',
    showHint: 'Show Hint',
    hideHint: 'Hide Hint',
    streak: 'Streak!',
    pts: 'pts',

    // Lesson Summary
    lessonCompleted: 'Lesson Completed!',
    totalScore: 'Total Score',
    accuracy: 'Accuracy',
    peakStreak: 'Peak Streak',
    completionTime: 'Completion Time',
    tryAgain: 'Try Again',
    backToTopics: 'Back to Topics',

    // Admin Authentication & Dashboard
    teacherLoginTitle: 'Teacher Admin Login',
    teacherLoginSubtitle: 'Enter administrator username and password to manage lessons',
    usernameLabel: 'Username',
    passwordLabel: 'Password',
    loginBtn: 'Log In',
    invalidCredentials: 'Invalid username or password!',
    logOut: 'Log Out',
    changePassword: 'Change Password',
    adminTitle: 'Teacher Lesson Manager',
    adminSubtitle: 'Create, edit exercises, and manage topic lists for your students.',
    jsonImportExport: 'Import / Export JSON',
    createLesson: 'Create New Lesson',
    topicTitle: 'Topic Title',
    category: 'Category',
    actions: 'Actions',
    edit: 'Edit',
    copy: 'Duplicate',
    delete: 'Delete',
    moveUp: 'Up',
    moveDown: 'Down',
    confirmDelete: 'Are you sure you want to delete this lesson?',

    // Change Password Modal
    changePasswordTitle: 'Change Admin Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    saveNewPassword: 'Save New Password',
    cancel: 'Cancel',
    passwordChangedSuccess: 'Password changed successfully!',
    passwordsDoNotMatch: 'New password and confirmation do not match!',
    incorrectCurrentPassword: 'Current password is incorrect!',

    // Game types labels
    clozeLabel: 'Cloze',
    matchingLabel: 'Matching',
    sentenceLabel: 'Sentence Builder',
    errorSpotterLabel: 'Error Spotter',
    wordScrambleLabel: 'Word Scramble',
  },
};
