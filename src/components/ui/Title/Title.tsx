import './_title.scss';

interface Props {
    title: string;
    subTitle: string;
    headingLevel?: 1 | 2 | 3;
}

export const Title = ({ title, subTitle, headingLevel = 2 }: Props) => {
    const HeadingTag = `h${headingLevel}` as "h1" | "h2" | "h3";

    return (
        <div className="titleContainer">
            <span className="title">{title}</span>
            <HeadingTag className="subTitle">{subTitle}</HeadingTag>
        </div>
    )
}
