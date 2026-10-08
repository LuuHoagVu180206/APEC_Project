import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const readCurrentUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
};

export const SchoolDashboardLogic = () => {
    const navigate = useNavigate();
    const { schoolId } = useParams();
    const [currentUser] = useState(readCurrentUser);
    const [dashboard, setDashboard] = useState(null);
    const [mySets, setMySets] = useState([]);
    const [myClasses, setMyClasses] = useState([]);
    const [announcementText, setAnnouncementText] = useState('');
    const [selectedSetId, setSelectedSetId] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [classForm, setClassForm] = useState({ className: '', semester: '', description: '' });
    const [selectedClass, setSelectedClass] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const requestConfig = { headers: { token: currentUser?.accessToken } };
    const loadDashboard = useCallback(async () => {
        const response = await axios.get(`http://localhost:5000/api/schools/${schoolId}/dashboard`, {
            headers: { token: currentUser.accessToken }
        });
        setDashboard(response.data);
    }, [currentUser, schoolId]);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login', { replace: true });
            return;
        }
        let isActive = true;
        axios.get(`http://localhost:5000/api/schools/${schoolId}/dashboard`, {
            headers: { token: currentUser.accessToken }
        }).then(async (dashboardResponse) => {
            if (!isActive) return;
            setDashboard(dashboardResponse.data);
            if (dashboardResponse.data.membership.communityRole === 'community_manager') {
                const setsResponse = await axios.get('http://localhost:5000/api/sets/my-sets', {
                    headers: { token: currentUser.accessToken }
                });
                if (isActive) setMySets(setsResponse.data);
            }
            if (currentUser.role === 'teacher') {
                const classesResponse = await axios.get('http://localhost:5000/api/classes/mine', {
                    headers: { token: currentUser.accessToken }
                });
                if (isActive) setMyClasses(classesResponse.data.filter((classItem) => !classItem.school));
            }
        }).catch((requestError) => {
            if (isActive) {
                setError(typeof requestError.response?.data === 'string'
                    ? requestError.response.data
                    : 'Không thể tải School Community.');
            }
        }).finally(() => {
            if (isActive) setIsLoading(false);
        });
        return () => { isActive = false; };
    }, [currentUser, navigate, schoolId]);

    const runAction = async (action) => {
        setError('');
        try {
            await action();
            await loadDashboard();
        } catch (requestError) {
            setError(typeof requestError.response?.data === 'string'
                ? requestError.response.data
                : 'Không thể hoàn thành thao tác.');
        }
    };

    const createAnnouncement = async (event) => {
        event.preventDefault();
        const content = announcementText.trim();
        if (!content) return;
        await runAction(async () => {
            await axios.post(`http://localhost:5000/api/schools/${schoolId}/announcements`, { content }, requestConfig);
            setAnnouncementText('');
        });
    };

    const deleteAnnouncement = (postId) => runAction(() =>
        axios.delete(`http://localhost:5000/api/schools/${schoolId}/announcements/${postId}`, requestConfig)
    );

    const removeMember = (memberId) => {
        if (window.confirm('Gỡ thành viên này khỏi trường?')) {
            return runAction(() => axios.delete(
                `http://localhost:5000/api/schools/${schoolId}/members/${memberId}`,
                requestConfig
            ));
        }
    };

    const shareQuestionSet = async () => {
        if (!selectedSetId) return;
        await runAction(async () => {
            await axios.post(`http://localhost:5000/api/schools/${schoolId}/shared-question-sets`, {
                questionSetId: selectedSetId
            }, requestConfig);
            setSelectedSetId('');
        });
    };

    const unshareQuestionSet = (questionSetId) => runAction(() =>
        axios.delete(`http://localhost:5000/api/schools/${schoolId}/shared-question-sets/${questionSetId}`, requestConfig)
    );

    const createClass = async (event) => {
        event.preventDefault();
        await runAction(async () => {
            await axios.post(`http://localhost:5000/api/schools/${schoolId}/classes`, classForm, requestConfig);
            setClassForm({ className: '', semester: '', description: '' });
        });
    };

    const addExistingClass = async () => {
        if (!selectedClassId) return;
        await runAction(async () => {
            await axios.post(
                `http://localhost:5000/api/schools/${schoolId}/classes/${selectedClassId}/import`,
                {},
                requestConfig
            );
            setMyClasses((classes) => classes.filter((classItem) => classItem._id !== selectedClassId));
            setSelectedClassId('');
        });
    };

    const deleteClass = (classId) => runAction(() =>
        axios.delete(`http://localhost:5000/api/schools/${schoolId}/classes/${classId}`, requestConfig)
    );

    const openClass = async (classId) => {
        setError('');
        try {
            const response = await axios.get(
                `http://localhost:5000/api/schools/${schoolId}/classes/${classId}`,
                requestConfig
            );
            setSelectedClass(response.data);
        } catch (requestError) {
            setError(typeof requestError.response?.data === 'string'
                ? requestError.response.data
                : 'Không thể tải lớp học.');
        }
    };

    const joinClass = async () => {
        if (!selectedClass) return;
        await runAction(async () => {
            await axios.post(
                `http://localhost:5000/api/schools/${schoolId}/classes/${selectedClass._id}/join`,
                {},
                requestConfig
            );
            const response = await axios.get(
                `http://localhost:5000/api/schools/${schoolId}/classes/${selectedClass._id}`,
                requestConfig
            );
            setSelectedClass(response.data);
        });
    };

    const isManager = dashboard?.membership?.communityRole === 'community_manager';
    const canCreateClasses = isManager || currentUser?.role === 'teacher';
    const sharedSetIds = new Set((dashboard?.sharedQuestionSets || [])
        .map((entry) => entry.questionSet?._id)
        .filter(Boolean));
    const availableSets = mySets.filter((set) => !sharedSetIds.has(set._id));

    return {
        currentUser,
        dashboard,
        isManager,
        canCreateClasses,
        availableSets,
        availableClasses: myClasses,
        selectedClassId,
        setSelectedClassId,
        selectedSetId,
        setSelectedSetId,
        announcementText,
        setAnnouncementText,
        classForm,
        setClassForm,
        selectedClass,
        setSelectedClass,
        error,
        isLoading,
        createAnnouncement,
        deleteAnnouncement,
        removeMember,
        shareQuestionSet,
        unshareQuestionSet,
        createClass,
        addExistingClass,
        deleteClass,
        openClass,
        joinClass,
        navigate
    };
};