import { Flex } from "antd";

type CategoryOptionType = {
    categoryName: string
    Icon: React.ComponentType;
}

function CategoryOption({categoryName, Icon}: CategoryOptionType) {
    return (
        <Flex>
            <span>{categoryName}</span>
            <Icon />
        </Flex>
    )
}

export default CategoryOption;