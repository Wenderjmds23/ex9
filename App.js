import React, { useState, useEffect } from 'react';
import { View, Image, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

// Inicializa o navegador de abas
const Tab = createMaterialTopTabNavigator();

const TarefasPorStatus = ({ status, tarefas, setTarefas }) => {
  const tarefasFiltradas = (tarefas || []).filter((tarefa) => tarefa.status === status);

  const editarTarefa = async (index) => {
    const novasTarefas = [...tarefas];
    novasTarefas[index].status =
      novasTarefas[index].status === 'Nova' ? 'Em andamento' : 'Concluída';
    await AsyncStorage.setItem('tarefas', JSON.stringify(novasTarefas));
    setTarefas(novasTarefas);
  };

  const excluirTarefa = async (index) => {
    const novasTarefas = tarefas.filter((_, i) => i !== index);
    await AsyncStorage.setItem('tarefas', JSON.stringify(novasTarefas));
    setTarefas(novasTarefas);
  };

  return (
    <FlatList
      data={tarefasFiltradas}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item, index }) => (
        <View
          style={[
            styles.listaItem,
            item.prioridade === 'Alta' && { backgroundColor: '#BDB76B'
             },
          ]}
        >
          <Text style={styles.texto}>
            {item.descricao} ({item.prioridade})
          </Text>
          <Button title="Mover" onPress={() => editarTarefa(index)} />
          <Button title="Excluir" onPress={() => excluirTarefa(index)} />
        </View>
      )}
    />
  );
};

const NovaScreen = ({ tarefas, setTarefas }) => (
  <TarefasPorStatus status="Nova" tarefas={tarefas} setTarefas={setTarefas} />
);
const EmAndamentoScreen = ({ tarefas, setTarefas }) => (
  <TarefasPorStatus status="Em andamento" tarefas={tarefas} setTarefas={setTarefas} />
);
const ConcluidaScreen = ({ tarefas, setTarefas }) => (
  <TarefasPorStatus status="Concluída" tarefas={tarefas} setTarefas={setTarefas} />
);

const App = () => {
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState('Normal');
  const [tarefas, setTarefas] = useState([]);

  useEffect(() => {
    carregarTarefas();
  }, []);

  const carregarTarefas = async () => {
    const data = await AsyncStorage.getItem('tarefas');
    if (data) {
      setTarefas(JSON.parse(data));
    }
  };

  const adicionarTarefa = async () => {
    if (descricao.trim() === '') return;
    const novasTarefas = [...tarefas, { descricao, prioridade, status: 'Nova' }];
    await AsyncStorage.setItem('tarefas', JSON.stringify(novasTarefas));
    setTarefas(novasTarefas);
    setDescricao('');
    setPrioridade('Normal');
  };

  return (
    <NavigationContainer>
      <View style={styles.container}>
      <Image style={styles.logo} source={require('./assets/gerenciamento-de-tarefas.png')} />
        <Text style={styles.titulo}>Gerenciador de Tarefas</Text>
        <TextInput
          style={styles.input}
          placeholder="Descrição da tarefa"
          value={descricao}
          onChangeText={setDescricao}
        />
        <TextInput
          style={styles.input}
          placeholder="Prioridade (Alta, Normal, Baixa)"
          value={prioridade}
          onChangeText={setPrioridade}
        />
        <Button title="Adicionar Tarefa" onPress={adicionarTarefa} />
      </View>
      <Tab.Navigator>
        <Tab.Screen name="Nova">
          {() => <NovaScreen tarefas={tarefas} setTarefas={setTarefas} />}
        </Tab.Screen>
        <Tab.Screen name="Em Andamento">
          {() => <EmAndamentoScreen tarefas={tarefas} setTarefas={setTarefas} />}
        </Tab.Screen>
        <Tab.Screen name="Concluída">
          {() => <ConcluidaScreen tarefas={tarefas} setTarefas={setTarefas} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#000000',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  listaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#A52A2A',
  },
  texto: {
    fontSize: 18,
  },
  logo: {
    height: 128,
    center:13,
    width: 128,
  }
});

export default App;