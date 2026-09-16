import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export const QuestionSetPageLogic = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    const [setData, setSetData] = useState(null);
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        const fetchSetDetails = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/sets/${id}`);
                setSetData(res.data.set);
                setQuestions(res.data.questions);
            } catch (err) {
                alert("Không thể tải chi tiết bộ câu hỏi!");
                console.error(err);
            }
        };
        fetchSetDetails();
    }, [id]);

    return { navigate, setData, questions };
};