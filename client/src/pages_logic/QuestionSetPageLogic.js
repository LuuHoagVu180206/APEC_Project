import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export const QuestionSetPageLogic = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const currentUser = (() => {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch {
            return null;
        }
    })();
    
    const [setData, setSetData] = useState(null);
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        const fetchSetDetails = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/sets/${id}`, {
                    headers: currentUser?.accessToken ? { token: currentUser.accessToken } : {}
                });
                setSetData(res.data.set);
                setQuestions(res.data.questions);
            } catch (err) {
                alert("Không thể tải chi tiết bộ câu hỏi!");
                console.error(err);
            }
        };
        fetchSetDetails();
    }, [currentUser?.accessToken, id]);

    return { navigate, setData, questions };
};