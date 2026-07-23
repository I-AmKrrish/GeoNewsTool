from dotenv import load_dotenv
load_dotenv()

from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import  RunnableParallel, RunnableLambda, RunnablePassthrough


model = ChatMistralAI(model = "mistral-small-2506")
parser = StrOutputParser()


code_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a code generator."),
    ("human", "{topic}" )
])


explain_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an expert code explainer, who explains code in simple terms."),
    ("human", "Explain the following code in simple terms: \n{code}")
])


seq = code_prompt | model | parser

seq2 = RunnableParallel(
    {"code" : RunnablePassthrough(),
    "explaination" : explain_prompt | model | parser
    }
)


chain = seq | seq2 


result = chain.invoke("Please write a code of pallindrome in python")

print(result["code"])
print("\n")
print(result["explaination"])