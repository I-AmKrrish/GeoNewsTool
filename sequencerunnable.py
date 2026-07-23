from dotenv import load_dotenv
load_dotenv()

from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableParallel, RunnableLambda

#component
model = ChatMistralAI(model = "mistral-small-2506")
parser = StrOutputParser()



#two different prompts 
short_prompt = ChatPromptTemplate.from_template(
    "Explain {topic} in one paragraph"
)
detailed_prompt = ChatPromptTemplate.from_template(
    "Explain {topic} in 3 paragraphs"
)



#input
topic = "Machine Learning"


chain = RunnableParallel({
    "short" : RunnableLambda(lambda x: x['short']) | short_prompt | model | parser,
    "detailed" : RunnableLambda(lambda x: x['detailed']) | detailed_prompt | model | parser
})


result = chain.invoke({
    "topic": topic
})



print(result['short'])
print("\n")
print(result['detailed'])