interface Props {
    requirements: string[];
}

const CourseRequirements: React.FC<Props> = ({ requirements }) => {
    if (!requirements || requirements.length === 0) return null;

    return (
        <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                Yêu cầu
            </h2>
            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {requirements.map((req, index) => (
                    <li key={index}>{req.replace(/^[•\-\.\s]+/, "")}</li>
                ))}
            </ul>
        </section>
    );
};

export default CourseRequirements;
