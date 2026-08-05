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
    studentView: 'Học bài',
    adminView: 'Dành cho thầy cô',

    // Student Dashboard
    heroTitle: 'Cùng học tiếng Anh nhé!',
    heroSubtitle: 'Chọn một bài học và bắt đầu nào.',
    searchPlaceholder: 'Tìm bài học...',
    topicsAvailable: 'bài học',
    startLearning: 'Vào học',
    completed: 'Đã học',
    highScore: 'Điểm tốt nhất',
    gamesCount: 'Bài tập',
    noTopicsFound: 'Chưa tìm thấy bài học.',

    // Game Engines
    question: 'Câu hỏi',
    matchingTitle: 'Nối các cặp đúng',
    checkAnswer: 'Xem kết quả',
    nextQuestion: 'Câu tiếp theo',
    finishSection: 'Tiếp tục',
    continue: 'Tiếp tục',
    wellDone: 'Giỏi lắm!',
    keepPracticing: 'Gần đúng rồi!',
    correctSentence: 'Đáp án:',
    allPairsMatched: 'Bạn đã nối xong!',
    totalAttempts: 'Số lượt:',
    terms: 'Tiếng Anh',
    meanings: 'Tiếng Việt',
    yourSentence: 'Câu của em',
    clickBlocks: 'Chạm vào các từ để xếp câu',
    availableBlocks: 'Chọn từ',
    clearAll: 'Làm lại',
    perfectArrangement: 'Đúng rồi!',
    incorrectOrder: 'Thử lại ở câu sau nhé!',
    clickWrongWord: 'Chạm vào từ sai rồi viết lại cho đúng.',
    greatEye: 'Em tìm đúng rồi!',
    notQuiteRight: 'Gần đúng rồi!',
    submitCorrection: 'Xem kết quả',
    correctSpelling: 'Đúng rồi!',
    incorrectSpelling: 'Gần đúng rồi!',
    checkWord: 'Xem kết quả',
    showHint: 'Gợi ý',
    hideHint: 'Đóng gợi ý',
    streak: 'liên tiếp',
    pts: 'điểm',
    chooseLetters: 'Chọn các chữ cái',
    correctWord: 'Từ đúng:',

    // Lesson Summary
    lessonCompleted: 'Em đã hoàn thành!',
    totalScore: 'Điểm của em',
    accuracy: 'Số câu đúng',
    peakStreak: 'Đúng liên tiếp',
    completionTime: 'Thời gian',
    tryAgain: 'Chơi lại',
    backToTopics: 'Chọn bài khác',

    // Admin Authentication & Dashboard
    teacherLoginTitle: 'Đăng Nhập Giáo Viên',
    teacherLoginSubtitle: 'Khu vực dành cho thầy cô',
    usernameLabel: 'Tên đăng nhập',
    passwordLabel: 'Mật khẩu',
    loginBtn: 'Đăng nhập',
    invalidCredentials: 'Tên đăng nhập hoặc mật khẩu không chính xác!',
    logOut: 'Đăng xuất',
    changePassword: 'Đổi mật khẩu',
    adminTitle: 'Bảng Quản Lý Bài Học',
    adminSubtitle: 'Thêm và sửa bài học cho học sinh.',
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
    studentView: 'Learn',
    adminView: 'For teachers',

    // Student Dashboard
    heroTitle: "Let's learn English!",
    heroSubtitle: 'Pick a lesson and start playing.',
    searchPlaceholder: 'Find a lesson...',
    topicsAvailable: 'lessons',
    startLearning: 'Start',
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
    chooseLetters: 'Choose the letters',
    correctWord: 'Correct word:',

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
